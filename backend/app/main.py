"""Local image analysis API. No application-level image retention; multipart temp files are closed."""

import asyncio
import io
import logging
import os
import secrets
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv

# Load .env from Dishari project root
load_dotenv(Path(__file__).resolve().parents[2] / ".env")

import httpx

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps, UnidentifiedImageError
from starlette.concurrency import run_in_threadpool

from . import vision

MAX_BYTES = 10 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 20_000_000
gate = asyncio.Semaphore(1)
log = logging.getLogger('dishari')


@asynccontextmanager
async def lifespan(app):
    try:
        await run_in_threadpool(vision.load_detector)
    except Exception:
        log.warning('Optional object detector could not load; check its installation and model file.')
    yield


app = FastAPI(title='Dishari Accessibility API', version='1.0.0', lifespan=lifespan)
origins = [s.strip() for s in os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173,http://localhost:4173,http://127.0.0.1:5173,http://127.0.0.1:4173,https://dishari-accessibility-assistant.onrender.com').split(',') if s.strip()] 
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=['GET', 'POST'], allow_headers=['Content-Type', 'X-API-Key'])


@app.get('/api/health')
def health():
    return {'status': 'ok', 'detector': vision.detector_ready(),
            'scene_configured': vision.scene_configured(),
            'scene_provider': vision.scene_provider(),
            'privacy': 'No image history. Gemini-enabled scene requests send the image to Google.'}


def decode_image(raw):
    try:
        image = Image.open(io.BytesIO(raw))
        if image.format not in ('JPEG', 'PNG', 'WEBP'):
            raise HTTPException(415, 'শুধু JPG, PNG, WebP ছবি দিন।')
        if image.width * image.height > Image.MAX_IMAGE_PIXELS:
            raise HTTPException(413, 'ছবির resolution খুব বড়। সর্বোচ্চ ২০ megapixel।')
        image.load()
        image = ImageOps.exif_transpose(image).convert('RGB')
        image.thumbnail((2200, 2200))
        return image
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(400, 'ছবিটি পড়া যাচ্ছে না। পরিষ্কার JPG/PNG দিন।') from None


@app.post('/api/analyze')
async def analyze(image: UploadFile = File(...), mode: Literal['scene', 'obstacle'] = Form(...),
                  x_api_key: str | None = Header(default=None)):
    token = os.getenv('API_KEY', '')
    if token and not secrets.compare_digest(token, x_api_key or ''):
        await image.close()
        raise HTTPException(401, 'API key সঠিক নয়।')
    try:
        raw = await image.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise HTTPException(413, 'ছবির আকার ১০ MB-এর নিচে রাখুন।')
        if not raw:
            raise HTTPException(400, 'ছবি খালি।')
        decoded = await run_in_threadpool(decode_image, raw)
        try:
            await asyncio.wait_for(gate.acquire(), timeout=.1)
        except TimeoutError:
            decoded.close()
            raise HTTPException(429, 'Backend এখন ব্যস্ত। কিছুক্ষণ পরে চেষ্টা করুন।') from None
        try:
            if mode == 'obstacle':
                objects = await run_in_threadpool(vision.detect, decoded)
                return {'text': vision.object_description(objects), 'objects': objects,
                        'warning': vision.OBJECT_WARNING, 'source': 'YOLO · single-image detection'}
            return await run_in_threadpool(vision.describe_scene, decoded)
        finally:
            gate.release()
            decoded.close()
    except RuntimeError as error:
        raise HTTPException(503, str(error)) from None
    except httpx.HTTPError:
        if vision.scene_provider() == 'gemini' and mode == 'scene':
            raise HTTPException(503, 'Gemini connection পাওয়া যায়নি। Internet পরীক্ষা করে আবার চেষ্টা করুন।') from None
        raise HTTPException(503, 'Local scene model পাওয়া যায়নি। Ollama server ও model পরীক্ষা করুন।') from None
    finally:
        await image.close()
