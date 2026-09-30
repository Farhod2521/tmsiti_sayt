"""Bosh sahifadagi 4 ta yo'nalish kartasi uchun 5 soniyalik takrorlanuvchi videolar.

Ishga tushirish:  pip install pillow numpy imageio-ffmpeg
                  python scripts/card-videos/make_card_videos.py
Natija: public/videos/cards/*.mp4 (ovozsiz, 720x272, 30 fps, uzilishsiz aylanadi)
Asos sifatida public/images/home/dir-*.jpg rasmlari jonlantiriladi;
laboratoriya kartasi — construction_scene.py dagi chizma sahna.
Faqat bittasini yaratish:  python scripts/card-videos/make_card_videos.py laboratory
"""
import math
import os
import subprocess

import sys

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from construction_scene import frame_construction

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.abspath(os.path.join(HERE, "..", ".."))
IMAGES = os.path.join(PROJECT, "public", "images", "home")
OUT_DIR = os.path.join(PROJECT, "public", "videos", "cards")

W, H, FPS, DURATION = 720, 272, 30, 5.0
FRAMES = int(FPS * DURATION)

NAVY = (11, 26, 79)
BLUE = (29, 91, 232)
WHITE = (255, 255, 255)
GREEN = (30, 158, 98)
ORANGE = (240, 105, 42)

FONTS = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


F_BOLD = lambda s: font("segoeuib.ttf", s)
F_REG = lambda s: font("segoeui.ttf", s)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def window(t, start, fade_in=0.5, end=4.4, fade_out=0.4):
    """Element 0 dan 1 gacha paydo bo'lib, oxirida yo'qoladi — aylanish uzilmasligi uchun."""
    return min(ease_out((t - start) / fade_in), 1 - clamp((t - end) / fade_out))


def load(name):
    img = Image.open(os.path.join(IMAGES, name)).convert("RGB")
    scale = max(W * 1.12 / img.width, H * 1.12 / img.height)
    return img.resize((int(img.width * scale), int(img.height * scale)), Image.LANCZOS)


def ken_burns(base, t, pan=0.5):
    """Davriy yaqinlashish/siljish: t=0 va t=DURATION kadrlari bir xil."""
    phase = 2 * math.pi * t / DURATION
    zoom = 1.0 + 0.05 * (1 - math.cos(phase)) / 2
    bw, bh = base.size
    k = min(bw / W, bh / H) / 1.06  # chetlarda siljish uchun zaxira
    cw, ch = int(W * k / zoom), int(H * k / zoom)
    cx = (bw - cw) * (0.5 + 0.4 * pan * math.sin(phase))
    cy = (bh - ch) * 0.5
    return base.crop((int(cx), int(cy), int(cx) + cw, int(cy) + ch)).resize((W, H), Image.BILINEAR).convert("RGBA")


def rounded_panel(layer, box, alpha, radius=14, fill=(255, 255, 255), fill_alpha=225):
    if alpha <= 0:
        return
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        (box[0], box[1] + 6, box[2], box[3] + 6), radius=radius, fill=NAVY + (int(60 * alpha),)
    )
    layer.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8)))
    panel = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(panel).rounded_rectangle(box, radius=radius, fill=fill + (int(fill_alpha * alpha),))
    layer.alpha_composite(panel)


def check_badge(d, cx, cy, r, alpha, color=GREEN):
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color + (int(255 * alpha),))
    d.line(
        [(cx - r * 0.45, cy + r * 0.02), (cx - r * 0.1, cy + r * 0.38), (cx + r * 0.5, cy - r * 0.35)],
        fill=WHITE + (int(255 * alpha),),
        width=max(2, int(r * 0.28)),
        joint="curve",
    )


# ---------- 1. Me'yoriy hujjatlar ----------
BASE_DOCS = load("dir-documents.jpg")


def frame_documents(t):
    img = ken_burns(BASE_DOCS, t, pan=0.6)
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    # chizma chiziqlari chiziladi
    lines = [((40, 200), (330, 200)), ((330, 200), (330, 70)), ((330, 70), (120, 70)), ((120, 70), (120, 140))]
    draw_p = clamp((t - 0.2) / 1.6)
    fade = window(t, 0.2, 0.3)
    total = len(lines)
    for i, (a, b) in enumerate(lines):
        seg = clamp(draw_p * total - i)
        if seg <= 0:
            continue
        x = a[0] + (b[0] - a[0]) * seg
        y = a[1] + (b[1] - a[1]) * seg
        d.line((a[0], a[1], x, y), fill=BLUE + (int(230 * fade),), width=4)
        d.ellipse((a[0] - 5, a[1] - 5, a[0] + 5, a[1] + 5), fill=BLUE + (int(255 * fade),))
    img.alpha_composite(over)

    # hujjat kartochkasi
    a = window(t, 1.3)
    if a > 0:
        dy = int(18 * (1 - a))
        box = (430, 60 + dy, 680, 212 + dy)
        rounded_panel(img, box, a)
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((452, 82 + dy, 500, 130 + dy), radius=10, fill=(228, 238, 255, int(255 * a)))
        d.rectangle((466, 95 + dy, 486, 117 + dy), outline=BLUE + (int(255 * a),), width=3)
        d.text((516, 84 + dy), "SHNQ", font=F_BOLD(24), fill=NAVY + (int(255 * a),))
        d.text((516, 112 + dy), "2.01.02-04", font=F_REG(20), fill=(91, 103, 136, int(255 * a)))
        for k, w in enumerate((200, 170, 185)):
            d.rounded_rectangle((452, 150 + dy + k * 18, 452 + w, 158 + dy + k * 18), radius=4,
                                fill=(225, 231, 243, int(255 * a)))
        s = window(t, 2.3, 0.35)
        if s > 0:
            check_badge(d, 650, 92 + dy, 20 * (0.6 + 0.4 * s), s)
    return img


# ---------- 2. Laboratoriya: qurilish maydonchasi (construction_scene.py) ----------


# ---------- 3. Standartlashtirish ----------
BASE_STD = load("dir-standards.jpg")


def gear_polygon(cx, cy, r_out, r_in, teeth, angle):
    pts = []
    for i in range(teeth * 4):
        ang = angle + i * math.pi * 2 / (teeth * 4)
        r = r_out if (i % 4) in (1, 2) else r_in
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def frame_standards(t):
    img = ken_burns(BASE_STD, t, pan=0.4)
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    ga = window(t, 0.1, 0.4)
    angle = 2 * math.pi * t / DURATION  # to'liq aylanish — aylanish uzilmaydi
    d.polygon(gear_polygon(612, 78, 44, 34, 10, angle), outline=(170, 215, 255, int(230 * ga)), width=3)
    d.ellipse((598, 64, 626, 92), outline=(170, 215, 255, int(230 * ga)), width=3)
    d.polygon(gear_polygon(662, 128, 26, 19, 8, -angle * 1.6), outline=(170, 215, 255, int(200 * ga)), width=3)
    img.alpha_composite(over)

    items = [("O‘zMSt", "Milliy standart"), ("ISO", "Xalqaro standart"), ("EN", "Yevropa standarti")]
    d = ImageDraw.Draw(img)
    for i, (code, label) in enumerate(items):
        a = window(t, 0.5 + i * 0.55, 0.45)
        if a <= 0:
            continue
        y = 42 + i * 66
        dx = int(30 * (1 - a))
        rounded_panel(img, (24 + dx, y, 290 + dx, y + 54), a, radius=12)
        d = ImageDraw.Draw(img)
        d.text((42 + dx, y + 8), code, font=F_BOLD(22), fill=NAVY + (int(255 * a),))
        d.text((42 + dx, y + 32), label, font=F_REG(15), fill=(91, 103, 136, int(255 * a)))
        c = window(t, 0.8 + i * 0.55, 0.3)
        if c > 0:
            check_badge(d, 262 + dx, y + 27, 13, c, color=ORANGE)
    return img


# ---------- 4. Xalqaro hamkorlik ----------
BASE_COOP = load("dir-cooperation.jpg")
NODES = [(90, 70), (230, 150), (360, 60), (470, 170), (610, 90), (300, 225), (560, 230)]
EDGES = [(0, 1), (1, 2), (2, 4), (1, 3), (3, 4), (1, 5), (5, 3), (3, 6)]


def frame_cooperation(t):
    img = ken_burns(BASE_COOP, t, pan=0.5)
    shade = Image.new("RGBA", (W, H), NAVY + (60,))
    img.alpha_composite(shade)
    over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    base_a = window(t, 0.1, 0.4, 4.4, 0.5)
    for k, (i, j) in enumerate(EDGES):
        p = ease_out((t - 0.3 - k * 0.22) / 0.6)
        if p <= 0:
            continue
        (x1, y1), (x2, y2) = NODES[i], NODES[j]
        d.line((x1, y1, x1 + (x2 - x1) * p, y1 + (y2 - y1) * p), fill=(200, 225, 255, int(200 * base_a)), width=3)
        # chiziq bo'ylab harakatlanuvchi nuqta
        q = ((t * 0.6 + k * 0.13) % 1.0)
        if p >= 1:
            px, py = x1 + (x2 - x1) * q, y1 + (y2 - y1) * q
            d.ellipse((px - 4, py - 4, px + 4, py + 4), fill=WHITE + (int(255 * base_a),))
    for n, (x, y) in enumerate(NODES):
        a = window(t, 0.2 + n * 0.15, 0.35)
        if a <= 0:
            continue
        pulse = (math.sin(2 * math.pi * (t / 1.25) + n) + 1) / 2
        r = 10 + 6 * pulse
        d.ellipse((x - r - 6, y - r - 6, x + r + 6, y + r + 6), fill=(29, 91, 232, int(60 * a)))
        d.ellipse((x - 9, y - 9, x + 9, y + 9), fill=BLUE + (int(255 * a),), outline=WHITE + (int(255 * a),), width=3)
    img.alpha_composite(over)
    return img


CARDS = {
    "documents": frame_documents,
    "laboratory": frame_construction,
    "standards": frame_standards,
    "cooperation": frame_cooperation,
}


def encode(name, fn):
    out = os.path.join(OUT_DIR, f"{name}.mp4")
    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "23",
           "-preset", "slow", "-movflags", "+faststart", "-an", out]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    for i in range(FRAMES):
        proc.stdin.write(fn(i / FPS).convert("RGB").tobytes())
    proc.stdin.close()
    proc.wait()
    print(name, os.path.getsize(out) // 1024, "KB")


def main():
    """Argumentsiz — hammasi; masalan `laboratory` berilsa, faqat o'sha video."""
    os.makedirs(OUT_DIR, exist_ok=True)
    selected = sys.argv[1:] or list(CARDS)
    for name in selected:
        encode(name, CARDS[name])


if __name__ == "__main__":
    main()
