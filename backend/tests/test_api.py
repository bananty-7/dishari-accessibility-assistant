import io

from fastapi.testclient import TestClient
from PIL import Image

from app.main import app, decode_image
from app import vision

client = TestClient(app)


def sample():
    out = io.BytesIO()
    Image.new('RGB', (100, 80), 'white').save(out, 'PNG')
    return out.getvalue()


def test_bad_image_rejected():
    r = client.post('/api/analyze', data={'mode': 'scene'}, files={'image': ('x.png', b'invalid', 'image/png')})
    assert r.status_code == 400


def test_missing_model_is_explicit(monkeypatch):
    monkeypatch.setattr(vision, '_model', None)
    monkeypatch.delenv('OLLAMA_VISION_MODEL', raising=False)
    r = client.post('/api/analyze', data={'mode': 'obstacle'}, files={'image': ('x.png', sample(), 'image/png')})
    assert r.status_code == 503


def test_key_enforced(monkeypatch):
    monkeypatch.setenv('API_KEY', 'test-secret')
    r = client.post('/api/analyze', data={'mode': 'scene'}, files={'image': ('x.png', sample(), 'image/png')})
    assert r.status_code == 401


def test_actual_detection_contract(monkeypatch):
    items = [{'label': 'chair', 'label_bn': 'চেয়ার', 'position': 'মাঝখানে', 'confidence': .83, 'box': [.1,.1,.8,.9]}]
    monkeypatch.setattr(vision, 'detect', lambda image: items)
    r = client.post('/api/analyze', data={'mode': 'obstacle'}, files={'image': ('x.png', sample(), 'image/png')})
    assert r.status_code == 200
    assert r.json()['objects'] == items
    assert 'নিরাপত্তা' in r.json()['warning']


def test_oversized_image_rejected():
    r = client.post('/api/analyze', data={'mode': 'scene'}, files={'image': ('x.jpg', b'x' * (10*1024*1024+1), 'image/jpeg')})
    assert r.status_code == 413


def test_unknown_mode_rejected():
    r = client.post('/api/analyze', data={'mode': 'dose'}, files={'image': ('x.png', sample(), 'image/png')})
    assert r.status_code == 422


def test_empty_detection_never_claims_clear_path():
    assert 'নিরাপদ নয়' in vision.object_description([])


def test_left_center_right():
    assert vision.position_for([0,0,20,20],100) == 'বামে'
    assert vision.position_for([40,0,60,20],100) == 'মাঝখানে'
    assert vision.position_for([80,0,100,20],100) == 'ডানে'


def test_decode_resizes():
    im = decode_image(sample())
    assert im.mode == 'RGB' and im.size == (100,80)
