import base64
import io
from unittest.mock import patch

import httpx
import pytest
from PIL import Image
from app import vision


@pytest.fixture(autouse=True)
def config(monkeypatch):
    monkeypatch.setenv('SCENE_PROVIDER', 'gemini')
    monkeypatch.setenv('GEMINI_API_KEY', 'test-placeholder-not-a-real-key')
    monkeypatch.setenv('GEMINI_MODEL', 'gemini-2.5-flash-lite')


def provider_response(status, data):
    def factory(**kwargs):
        def handle(request):
            assert request.url.host == 'generativelanguage.googleapis.com'
            assert 'key=' not in str(request.url)
            assert request.headers['x-goog-api-key'] == 'test-placeholder-not-a-real-key'
            import json
            payload = json.loads(request.content)
            assert payload['generationConfig']['maxOutputTokens'] == 512
            assert payload['generationConfig']['thinkingConfig']['thinkingBudget'] == 0
            encoded = payload['contents'][0]['parts'][1]['inlineData']['data']
            with Image.open(io.BytesIO(base64.b64decode(encoded))) as im:
                assert max(im.size) <= 1024
            return httpx.Response(status, json=data)
        return real_client(transport=httpx.MockTransport(handle), **kwargs)
    return factory


real_client = httpx.Client


def test_real_request_shape_and_bengali_result():
    data = {'candidates': [{'finishReason': 'STOP', 'content': {'parts': [
        {'text': 'private thought', 'thought': True}, {'text': 'ছবিতে একটি চেয়ার দেখা যাচ্ছে।'}]}}]}
    with patch.object(vision.httpx, 'Client', provider_response(200, data)):
        image = Image.new('RGB', (2400, 1600), 'white')
        result = vision.describe_scene(image)
        assert image.size == (2400, 1600)
    assert result['provider'] == 'gemini'
    assert result['text'] == 'ছবিতে একটি চেয়ার দেখা যাচ্ছে।'
    assert 'Google' in result['warning']


@pytest.mark.parametrize('status,keyword', [(403, 'অনুমোদিত'), (429, 'quota'), (404, 'model'), (500, 'service')])
def test_provider_errors_are_sanitized(status, keyword):
    with patch.object(vision.httpx, 'Client', provider_response(status, {'error': {'message': 'secret provider details'}})):
        with pytest.raises(RuntimeError, match=keyword) as error:
            vision.describe_scene(Image.new('RGB', (100,100)))
    assert 'secret' not in str(error.value)


def test_no_key_does_not_send_request(monkeypatch):
    monkeypatch.delenv('GEMINI_API_KEY')
    with patch.object(vision.httpx, 'Client') as network:
        with pytest.raises(RuntimeError, match='GEMINI_API_KEY'):
            vision.describe_scene(Image.new('RGB', (100,100)))
        network.assert_not_called()


def test_blocked_empty_response():
    with patch.object(vision.httpx, 'Client', provider_response(200, {'promptFeedback': {'blockReason':'SAFETY'}})):
        with pytest.raises(RuntimeError, match='ব্যবহারযোগ্য'):
            vision.describe_scene(Image.new('RGB',(100,100)))


def test_local_is_still_explicit_and_does_not_use_key(monkeypatch):
    monkeypatch.setenv('SCENE_PROVIDER','local')
    monkeypatch.delenv('OLLAMA_VISION_MODEL',raising=False)
    with patch.object(vision,'detect',return_value=[]), patch.object(vision.httpx,'Client') as network:
        result=vision.describe_scene(Image.new('RGB',(100,100)))
        assert result['source']=='YOLO object summary'
        network.assert_not_called()


def test_health_shows_provider_without_exposing_key():
    from fastapi.testclient import TestClient
    from app.main import app
    data=TestClient(app).get('/api/health').json()
    assert data['scene_provider']=='gemini' and data['scene_configured'] is True
    assert 'test-placeholder' not in str(data)


def test_cloud_quota_api_response():
    from fastapi.testclient import TestClient
    from app.main import app
    buf=io.BytesIO();Image.new('RGB',(100,100)).save(buf,format='PNG')
    with patch.object(vision,'describe_scene',side_effect=RuntimeError('Gemini quota শেষ হয়েছে।')):
        r=TestClient(app).post('/api/analyze',data={'mode':'scene'},files={'image':('x.png',buf.getvalue(),'image/png')})
    assert r.status_code==503 and 'quota' in r.json()['detail']
