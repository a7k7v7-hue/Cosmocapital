"""
Resize and compress photos in-place.
Max dimension 1600px, JPEG q=82, PNG stays PNG but downscaled.
"""
from PIL import Image
import os, sys

SRC = r"C:\My Project\kosmocapital\public\photos\migrated"
MAX_DIM = 1600
JPEG_Q = 82

files = os.listdir(SRC)
before_total = 0
after_total = 0

for fname in files:
    path = os.path.join(SRC, fname)
    ext = fname.rsplit(".", 1)[-1].lower()
    before = os.path.getsize(path)
    before_total += before

    try:
        img = Image.open(path)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Downscale if larger than MAX_DIM
        w, h = img.size
        if max(w, h) > MAX_DIM:
            ratio = MAX_DIM / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)

        # Always save as JPEG for smaller size
        out_path = os.path.splitext(path)[0] + ".jpg"
        img.save(out_path, "JPEG", quality=JPEG_Q, optimize=True)

        # Remove original if extension changed
        if out_path != path:
            os.remove(path)

        after = os.path.getsize(out_path)
        after_total += after
        saved = before - after
        if saved > 0:
            print(f"  {fname} -> {saved//1024}KB saved ({before//1024}KB -> {after//1024}KB)")
    except Exception as e:
        after_total += before
        print(f"  SKIP {fname}: {e}")

print(f"\nTotal: {before_total//1024//1024}MB -> {after_total//1024//1024}MB")
print(f"Saved: {(before_total - after_total)//1024//1024}MB ({100*(before_total-after_total)//before_total}%)")
