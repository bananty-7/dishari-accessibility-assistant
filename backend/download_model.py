"""Explicit first-time model download; never downloads a model during a user request."""
from pathlib import Path
import shutil

from ultralytics import YOLO

destination = Path('models/yolo11n.pt')
destination.parent.mkdir(exist_ok=True)
if destination.exists():
    print('Model already available:', destination)
else:
    model = YOLO('yolo11n.pt')
    source = Path(model.ckpt_path)
    if source.resolve() != destination.resolve():
        shutil.move(str(source), str(destination))
    print('Model ready:', destination)
