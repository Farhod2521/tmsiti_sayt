"""TMSITI tanishtiruv videosi (10 s, 1920x1080, 30 fps) — motion-grafika.

Ishga tushirish:  pip install pillow numpy imageio-ffmpeg
                  python scripts/intro-video/make_video.py
Natija: public/videos/tmsiti-intro.mp4 va tmsiti-intro-poster.jpg
Raqamlar (STATS) va matnlar shu faylda — o'zgarsa, qayta ishga tushiring.
Shriftlar Windows'dagi Segoe UI (C:\\Windows\\Fonts).
"""
import os
import subprocess

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.abspath(os.path.join(HERE, "..", ".."))
OUT = os.path.join(PROJECT, "public", "videos", "tmsiti-intro.mp4")
POSTER = os.path.join(PROJECT, "public", "videos", "tmsiti-intro-poster.jpg")

W, H, FPS, DURATION = 1920, 1080, 30, 10.0
NAVY = (11, 26, 79)
NAVY_DEEP = (7, 18, 58)
BLUE = (29, 91, 232)
LIGHT_BG = (246, 249, 255)
WHITE = (255, 255, 255)
MUTED = (91, 103, 136)

FONTS = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONTS, name), size)


F_BOLD = lambda s: font("segoeuib.ttf", s)
F_SEMI = lambda s: font("seguisb.ttf", s) if os.path.exists(os.path.join(FONTS, "seguisb.ttf")) else font("segoeuib.ttf", s)
F_REG = lambda s: font("segoeui.ttf", s)
F_LIGHT = lambda s: font("segoeuil.ttf", s)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp(x)
    return 3 * x * x - 2 * x * x * x


def progress(t, start, dur):
    return clamp((t - start) / dur)


# ---------- resurslar ----------
building = Image.open(os.path.join(PROJECT, "public", "images", "homepage-back.png")).convert("RGB")
scale = H * 1.18 / building.height
building_big = building.resize((int(building.width * scale), int(building.height * scale)), Image.LANCZOS)

logo_white = Image.open(os.path.join(HERE, "logo-brand-white.png")).convert("RGBA")
logo_color = Image.open(os.path.join(HERE, "logo-brand.png")).convert("RGBA")


def logo(img, height):
    ratio = height / img.height
    return img.resize((int(img.width * ratio), height), Image.LANCZOS)


LOGO_W_140 = logo(logo_white, 140)
LOGO_W_120 = logo(logo_white, 120)


def horizontal_gradient(width, height, left_rgba, right_rgba):
    xs = np.linspace(0, 1, width)[None, :, None]
    left = np.array(left_rgba, dtype=np.float32)[None, None, :]
    right = np.array(right_rgba, dtype=np.float32)[None, None, :]
    arr = left + (right - left) * xs
    arr = np.repeat(arr, height, axis=0)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


OVERLAY_S1 = horizontal_gradient(W, H, (7, 18, 58, 235), (7, 18, 58, 20))
OVERLAY_S4 = Image.new("RGBA", (W, H), (7, 18, 58, 215))


def building_frame(zoom, focus_x=0.62, focus_y=0.45, blur=0):
    """Ken Burns: binoni sekin yaqinlashtirish."""
    bw, bh = building_big.size
    cw, ch = int(W / zoom * (bh / H) / (bh / H)), int(H / zoom)
    cw = int(W / zoom)
    x = int((bw - cw) * focus_x)
    y = int((bh - ch) * focus_y)
    crop = building_big.crop((x, y, x + cw, y + ch)).resize((W, H), Image.BILINEAR)
    if blur:
        crop = crop.filter(ImageFilter.GaussianBlur(blur))
    return crop.convert("RGBA")


def draw_text(layer, xy, text, fnt, fill, alpha=1.0, anchor="la"):
    if alpha <= 0:
        return
    tmp = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    ImageDraw.Draw(tmp).text(xy, text, font=fnt, fill=fill + (int(255 * alpha),), anchor=anchor)
    layer.alpha_composite(tmp)


def paste_alpha(layer, img, xy, alpha=1.0):
    if alpha <= 0:
        return
    if alpha < 1:
        img = img.copy()
        a = img.getchannel("A").point(lambda v: int(v * alpha))
        img.putalpha(a)
    layer.alpha_composite(img, dest=(int(xy[0]), int(xy[1])))


# ---------- sahnalar ----------
def scene_intro(t):
    """0–3.2 s: bino, logotip, institut nomi."""
    frame = building_frame(1.0 + 0.06 * (t / 3.2), focus_x=0.86)
    frame.alpha_composite(OVERLAY_S1)
    x0 = 150
    a = ease_out(progress(t, 0.25, 0.8))
    paste_alpha(frame, LOGO_W_140, (x0, 300 - 30 * (1 - a)), a)

    a = ease_out(progress(t, 0.55, 0.8))
    draw_text(frame, (x0, 480 + 30 * (1 - a)), "TMSITI", F_BOLD(128), WHITE, a)

    line = ease_out(progress(t, 0.9, 0.9))
    if line > 0:
        ImageDraw.Draw(frame).rectangle((x0, 648, x0 + int(120 * line), 654), fill=BLUE + (255,))

    a = ease_out(progress(t, 1.05, 0.8))
    draw_text(frame, (x0, 690 + 20 * (1 - a)), "Texnik me’yorlash va standartlashtirish", F_REG(46), WHITE, a)
    draw_text(frame, (x0, 750 + 20 * (1 - a)), "ilmiy-tadqiqot instituti", F_REG(46), WHITE, a)
    return frame


DIRECTIONS = [
    ("01", "Shaharsozlik normalari va qoidalari"),
    ("02", "Milliy va xalqaro standartlar"),
    ("03", "BIM — axborot modellashtirish texnologiyalari"),
    ("04", "Energoaudit va energosamaradorlik ekspertizasi"),
]


def blueprint_bg():
    bg = Image.new("RGBA", (W + 120, H + 120), NAVY_DEEP + (255,))
    d = ImageDraw.Draw(bg)
    for x in range(0, W + 120, 60):
        d.line((x, 0, x, H + 120), fill=(40, 70, 150, 60), width=1)
    for y in range(0, H + 120, 60):
        d.line((0, y, W + 120, y), fill=(40, 70, 150, 60), width=1)
    for x in range(0, W + 120, 300):
        d.line((x, 0, x, H + 120), fill=(60, 100, 200, 90), width=1)
    for y in range(0, H + 120, 300):
        d.line((0, y, W + 120, y), fill=(60, 100, 200, 90), width=1)
    return bg


BLUEPRINT = blueprint_bg()


def scene_directions(t):
    """3.2–5.9 s: asosiy yo'nalishlar."""
    shift = int(40 * (t / 2.7))
    frame = BLUEPRINT.crop((shift, shift // 2, shift + W, shift // 2 + H))
    x0 = 150
    a = ease_out(progress(t, 0.1, 0.6))
    draw_text(frame, (x0, 170), "ASOSIY YO‘NALISHLAR", F_SEMI(34), (140, 175, 255), a)
    draw_text(frame, (x0, 225 + 20 * (1 - a)), "Qurilish sohasida ishonchli me’yorlar", F_BOLD(72), WHITE, a)

    for i, (num, label) in enumerate(DIRECTIONS):
        p = ease_out(progress(t, 0.45 + i * 0.22, 0.6))
        if p <= 0:
            continue
        y = 420 + i * 135
        dx = int(60 * (1 - p))
        card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        d = ImageDraw.Draw(card)
        d.rounded_rectangle((x0 + dx, y, x0 + dx + 1180, y + 105), radius=22,
                            fill=(255, 255, 255, int(22 * p)), outline=(120, 160, 255, int(90 * p)), width=2)
        d.rounded_rectangle((x0 + dx + 24, y + 22, x0 + dx + 24 + 62, y + 84), radius=16, fill=BLUE + (int(255 * p),))
        d.text((x0 + dx + 55, y + 53), num, font=F_BOLD(30), fill=WHITE + (int(255 * p),), anchor="mm")
        d.text((x0 + dx + 115, y + 52), label, font=F_SEMI(40), fill=WHITE + (int(255 * p),), anchor="lm")
        frame.alpha_composite(card)
    return frame


STATS = [
    (177, "Shaharsozlik normalari\nva qoidalari (SHNQ, QMQ)"),
    (348, "Milliy va xalqaro\nstandartlar"),
    (11, "Tarkibiy\nbo‘linmalar"),
]


def scene_stats(t):
    """5.9–8.3 s: saytdagi haqiqiy raqamlar."""
    frame = Image.new("RGBA", (W, H), LIGHT_BG + (255,))
    d = ImageDraw.Draw(frame)
    # yumshoq bezak doiralar
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((1350, -300, 2250, 600), fill=(29, 91, 232, 28))
    ImageDraw.Draw(glow).ellipse((-300, 650, 500, 1450), fill=(29, 91, 232, 18))
    frame.alpha_composite(glow.filter(ImageFilter.GaussianBlur(60)))

    a = ease_out(progress(t, 0.05, 0.6))
    draw_text(frame, (W // 2, 200), "RAQAMLARDA", F_SEMI(34), BLUE, a, anchor="mm")
    draw_text(frame, (W // 2, 275 + 15 * (1 - a)), "Me’yoriy-texnik baza", F_BOLD(68), NAVY, a, anchor="mm")

    col_w = 520
    start_x = (W - col_w * 3) // 2
    for i, (value, label) in enumerate(STATS):
        p = ease_out(progress(t, 0.3 + i * 0.18, 0.7))
        if p <= 0:
            continue
        count = int(round(value * ease_out(progress(t, 0.3 + i * 0.18, 1.3))))
        cx = start_x + col_w * i + col_w // 2
        card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        cd = ImageDraw.Draw(card)
        top = 420 + int(40 * (1 - p))
        cd.rounded_rectangle((cx - 225, top, cx + 225, top + 380), radius=32, fill=WHITE + (int(255 * p),))
        cd.rounded_rectangle((cx - 40, top + 50, cx + 40, top + 56), radius=3, fill=BLUE + (int(255 * p),))
        cd.text((cx, top + 150), str(count), font=F_BOLD(120), fill=NAVY + (int(255 * p),), anchor="mm")
        cd.multiline_text((cx, top + 280), label, font=F_REG(34), fill=MUTED + (int(255 * p),), anchor="mm", align="center", spacing=8)
        shadow = card.getchannel("A").filter(ImageFilter.GaussianBlur(24)).point(lambda v: int(v * 0.10))
        sh = Image.new("RGBA", (W, H), NAVY + (0,))
        sh.putalpha(shadow)
        frame.alpha_composite(sh, dest=(0, 14))
        frame.alpha_composite(card)
    return frame


def scene_final(t):
    """8.3–10 s: yakuniy kadr."""
    frame = building_frame(1.08 - 0.03 * (t / 1.7), focus_x=0.8, focus_y=0.35, blur=6)
    frame.alpha_composite(OVERLAY_S4)
    a = ease_out(progress(t, 0.1, 0.7))
    lg = LOGO_W_120
    paste_alpha(frame, lg, (W // 2 - lg.width // 2, 250 - 20 * (1 - a)), a)
    draw_text(frame, (W // 2, 470), "TMSITI", F_BOLD(96), WHITE, a, anchor="mm")

    b = ease_out(progress(t, 0.35, 0.7))
    draw_text(frame, (W // 2, 565), "Texnik me’yorlash va standartlashtirish ilmiy-tadqiqot instituti", F_REG(40), (220, 228, 250), b, anchor="mm")

    c = ease_out(progress(t, 0.6, 0.7))
    draw_text(frame, (W // 2, 670), "ILM  •  STANDART  •  RIVOJLANISH", F_SEMI(36), (140, 175, 255), c, anchor="mm")
    draw_text(frame, (W // 2, 800), "tmsiti.uz", F_SEMI(44), WHITE, c, anchor="mm")
    return frame


SCENES = [
    (0.0, 3.2, scene_intro),
    (3.2, 5.9, scene_directions),
    (5.9, 8.3, scene_stats),
    (8.3, 10.0, scene_final),
]
XFADE = 0.45


def render(t):
    for idx, (start, end, fn) in enumerate(SCENES):
        if start <= t < end or (idx == len(SCENES) - 1 and t >= start):
            img = fn(t - start)
            # keyingi sahnaga yumshoq o'tish
            if idx + 1 < len(SCENES) and t > end - XFADE:
                nstart, _, nfn = SCENES[idx + 1]
                k = ease_in_out((t - (end - XFADE)) / XFADE)
                img = Image.blend(img, nfn(max(0.0, t - nstart + XFADE * 0) if t >= nstart else 0.0), k)
            # boshida va oxirida qoramtirdan chiqish/kirish
            fade_in = ease_out(clamp(t / 0.35))
            fade_out = 1 - ease_in_out(clamp((t - (DURATION - 0.4)) / 0.4))
            f = min(fade_in, fade_out)
            if f < 1:
                img = Image.blend(Image.new("RGBA", (W, H), NAVY_DEEP + (255,)), img, f)
            return img.convert("RGB")


def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    cmd = [ffmpeg, "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "21", "-preset", "slow",
           "-movflags", "+faststart", OUT]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    total = int(DURATION * FPS)
    for i in range(total):
        t = i / FPS
        img = render(t)
        if abs(t - 1.8) < 0.5 / FPS:
            img.save(POSTER, quality=88)
        proc.stdin.write(img.tobytes())
        if i % 30 == 0:
            print(f"{i}/{total}", flush=True)
    proc.stdin.close()
    proc.wait()
    print("done", OUT, os.path.getsize(OUT))


if __name__ == "__main__":
    main()
