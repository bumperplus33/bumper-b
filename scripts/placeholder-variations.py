"""Make placeholder variations of one black-and-white photo.

Usage: python3 scripts/placeholder-variations.py SOURCE OUT_DIR

Writes the 12 project images, the video poster and Home's 4 liner-notes
images under their current file names, so they can be copied over
public/images and public/assets/images without code changes. The crops are
in pixels of a 560x322 source; scale them if the source is larger.
Each variation is a crop (in source pixels, after trimming the screenshot's
flat border), a tone treatment, an optional mirror, enlargement with mild
sharpening, and fine film grain.
"""
import sys
from PIL import Image, ImageFilter, ImageOps, ImageChops

src_path, out_dir = sys.argv[1], sys.argv[2]
src = Image.open(src_path).convert("L")
src = src.crop((1, 2, src.width - 1, src.height - 1))  # trim the flat border

def lut(fn):
    return [max(0, min(255, round(fn(v / 255) * 255))) for v in range(256)]

TONES = {
    "neutral": lut(lambda v: v),
    "contrast": lut(lambda v: 0.5 + (v - 0.5) * 1.35),
    "matte": lut(lambda v: 0.09 + v * 0.84),
    "lowkey": lut(lambda v: (v ** 1.9) * 0.92),
    "highkey": lut(lambda v: 0.08 + (v ** 0.62) * 0.92),
}

def grain(im, amount):
    """Fine film grain: soft noise, overlaid at a fraction of its strength."""
    noise = Image.effect_noise(im.size, 48).filter(ImageFilter.GaussianBlur(0.6))
    noise = noise.point(lambda v: round(128 + (v - 128) * amount))
    return ImageChops.overlay(im, noise)


def make(name, crop, size, tone="neutral", mirror=False, fmt="JPEG"):
    x, y, w, h = crop
    im = src.crop((x, y, x + w, y + h))
    if mirror:
        im = ImageOps.mirror(im)
    im = im.point(TONES[tone])
    # Cover-fit to the target size, then sharpen the enlargement a little
    im = ImageOps.fit(im, size, Image.LANCZOS, centering=(0.5, 0.5))
    im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=55, threshold=2))
    im = grain(im, 0.35)
    path = f"{out_dir}/{name}"
    if fmt == "JPEG":
        im.convert("RGB").save(path, "JPEG", quality=82, optimize=True, progressive=True)
    else:
        im.convert("RGB").save(path, "WEBP", quality=80)
    print(f"{name:20s} crop {crop} -> {size[0]}x{size[1]} {tone}{' mirrored' if mirror else ''}")

L = (1920, 1280)  # the project images are 3:2
make("project-1.jpg",  (30, 0, 480, 319),  L, "neutral")              # the whole scene
make("project-2.jpg",  (165, 18, 210, 140), L, "contrast")            # face and hat
make("project-3.jpg",  (60, 58, 240, 160),  L, "matte")               # hand on the horse
make("project-4.jpg",  (250, 165, 225, 150), L, "lowkey")             # coat texture
make("project-5.jpg",  (405, 60, 150, 100), L, "lowkey", True)        # barn wall, mirrored
make("project-6.jpg",  (0, 0, 300, 200),    L, "highkey", True)       # sky, mountains, hand, mirrored
make("project-7.jpg",  (30, 0, 480, 319),   L, "contrast", True)      # whole scene, mirrored
make("project-8.jpg",  (220, 52, 135, 90),  L, "contrast")            # sunglasses
make("project-9.jpg",  (330, 120, 195, 130), L, "lowkey")             # coat and sleeve, dark
make("project-10.jpg", (0, 0, 558, 319),    (1760, 1006), "contrast", True)  # About: the full frame, mirrored
make("project-12.jpg", (205, 95, 180, 120), L, "matte")               # braid and hand
make("project-11.jpg", (85, 68, 120, 80),   L, "matte")               # hand detail
make("video-poster.jpg", (0, 0, 558, 319),  (1518, 868), "matte")     # video poster
S4 = (768, 529)  # Home's small liner-notes image (shown 4:5)
make("image_001.webp", (190, 18, 180, 124), S4, "lowkey", True, fmt="WEBP")
make("image_004.webp", (300, 190, 150, 103), S4, "lowkey", fmt="WEBP")
make("image_007.webp", (80, 68, 150, 103),  S4, "highkey", fmt="WEBP")
make("image_010.webp", (418, 90, 139, 96),  S4, "lowkey", True, fmt="WEBP")
