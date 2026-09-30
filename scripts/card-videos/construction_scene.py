"""Laboratoriya kartasi: qurilish maydonchasida beton mustahkamligini o'lchash (flat illyustratsiya).

Barcha koordinatalar 720x272 o'lchamda; silliq chiziqlar uchun S marta katta chizilib kichraytiriladi.
Hamma harakatlar 5 soniyalik davriy — video uzilishsiz aylanadi.
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, DURATION = 720, 272, 5.0
S = 2  # supersampling
GROUND = 232

FONTS = r"C:\Windows\Fonts"
F_BOLD = lambda s: ImageFont.truetype(os.path.join(FONTS, "segoeuib.ttf"), s * S)
F_REG = lambda s: ImageFont.truetype(os.path.join(FONTS, "segoeui.ttf"), s * S)

NAVY = (11, 26, 79)
CONCRETE = (184, 191, 204)
CONCRETE_DARK = (150, 158, 176)
SLAB = (160, 168, 185)
INTERIOR = (222, 228, 238)
CRANE = (214, 160, 58)
CRANE_DARK = (176, 128, 40)
VEST = (240, 128, 42)
TROUSERS = (40, 54, 99)
SKIN = (214, 166, 128)
HAT = (250, 250, 252)
WHITE = (255, 255, 255)


def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease_out(x):
    x = clamp(x)
    return 1 - (1 - x) ** 3


def window(t, start, fade_in=0.5, end=4.4, fade_out=0.4):
    return min(ease_out((t - start) / fade_in), 1 - clamp((t - end) / fade_out))


def sc(*vals):
    return tuple(v * S for v in vals)


def rgba(color, a=1.0):
    return color + (int(255 * a),)


# ---------- statik fon (bir marta chiziladi) ----------
def build_background():
    img = Image.new("RGBA", (W * S, H * S))
    # osmon gradienti
    top, bottom = (205, 224, 250), (240, 245, 253)
    d = ImageDraw.Draw(img)
    for y in range(GROUND * S):
        k = y / (GROUND * S)
        c = tuple(int(top[i] + (bottom[i] - top[i]) * k) for i in range(3))
        d.line((0, y, W * S, y), fill=c + (255,))
    # uzoqdagi shahar silueti
    for x, w, h in [(0, 40, 70), (38, 30, 110), (66, 46, 85), (110, 26, 130), (134, 50, 95),
                    (182, 34, 120), (214, 44, 80), (560, 40, 90), (660, 30, 120), (688, 40, 75)]:
        d.rectangle(sc(x, GROUND - h, x + w, GROUND), fill=(196, 211, 234, 255))
    # yer
    d.rectangle(sc(0, GROUND, W, H), fill=(214, 218, 226, 255))
    d.rectangle(sc(0, GROUND, W, GROUND + 3), fill=(190, 196, 208, 255))

    # qurilayotgan bino: ichki qism, ustunlar, orayopmalar
    bx0, bx1, top_slab = 300, 560, 52
    d.rectangle(sc(bx0, top_slab, bx1, GROUND), fill=INTERIOR + (255,))
    floors = [GROUND, 172, 112, top_slab]
    for fy in floors[1:]:
        d.rectangle(sc(bx0 - 6, fy, bx1 + 6, fy + 9), fill=SLAB + (255,))
        d.rectangle(sc(bx0 - 6, fy + 9, bx1 + 6, fy + 11), fill=CONCRETE_DARK + (255,))
    for cx in (300, 386, 472, 544):
        d.rectangle(sc(cx, top_slab, cx + 16, GROUND), fill=CONCRETE + (255,))
        d.rectangle(sc(cx + 12, top_slab, cx + 16, GROUND), fill=CONCRETE_DARK + (255,))
        # yuqori qavatdan chiqib turgan armatura
        for k in (3, 8, 13):
            d.line(sc(cx + k, top_slab, cx + k, top_slab - 22), fill=(120, 96, 80, 255), width=2 * S)
    # yuqori qavat qolipi (opalubka)
    d.rectangle(sc(386, top_slab - 18, 470, top_slab), fill=(201, 162, 107, 255))
    for x in range(390, 470, 14):
        d.line(sc(x, top_slab - 18, x, top_slab), fill=(178, 140, 88, 255), width=S)
    # havozalar
    for x in (568, 590):
        d.line(sc(x, GROUND, x, 60), fill=(150, 160, 180, 255), width=2 * S)
    for y in range(80, GROUND, 38):
        d.line(sc(566, y, 592, y), fill=(150, 160, 180, 255), width=2 * S)
        d.line(sc(568, y, 590, y + 38), fill=(170, 178, 196, 255), width=S)

    # minorali kran (machta va strela)
    mx = 630
    d.line(sc(mx, GROUND, mx, 30), fill=CRANE + (255,), width=3 * S)
    d.line(sc(mx + 16, GROUND, mx + 16, 30), fill=CRANE + (255,), width=3 * S)
    for k, y in enumerate(range(GROUND, 46, -16)):
        x_from, x_to = (mx, mx + 16) if k % 2 == 0 else (mx + 16, mx)
        d.line(sc(x_from, y, x_to, y - 16), fill=CRANE_DARK + (255,), width=S * 2)
    d.rectangle(sc(mx - 4, 22, mx + 22, 36), fill=CRANE_DARK + (255,))  # kabina
    d.line(sc(420, 26, 712, 26), fill=CRANE + (255,), width=3 * S)
    d.line(sc(420, 36, 712, 36), fill=CRANE + (255,), width=3 * S)
    for k, x in enumerate(range(420, 712, 14)):
        y_from, y_to = (36, 26) if k % 2 == 0 else (26, 36)
        d.line(sc(x, y_from, x + 14, y_to), fill=CRANE_DARK + (255,), width=S * 2)
    d.rectangle(sc(684, 36, 712, 52), fill=(120, 126, 140, 255))  # qarshi yuk
    d.line(sc(mx + 8, 8, 430, 26), fill=CRANE_DARK + (255,), width=S)
    d.line(sc(mx + 8, 8, 700, 26), fill=CRANE_DARK + (255,), width=S)
    d.line(sc(mx + 8, 8, mx + 8, 22), fill=CRANE_DARK + (255,), width=2 * S)
    return img


BACKGROUND = build_background()


def draw_clouds(d, t):
    shift = (t / DURATION) * W  # bir aylanishda to'liq o'tadi — uzilishsiz
    for base_x, y, s in [(80, 34, 1.0), (330, 20, 0.8), (560, 60, 0.9)]:
        for offset in (0, W):
            x = (base_x + shift) % W - offset
            for dx, dy, r in [(0, 0, 14), (16, -6, 17), (34, 0, 13), (18, 6, 12)]:
                cx, cy, rr = x + dx * s, y + dy * s, r * s
                d.ellipse(sc(cx - rr, cy - rr, cx + rr, cy + rr), fill=(255, 255, 255, 190))


def draw_crane_load(d, t):
    """Kran yuki (beton bunkeri) sekin tebranadi."""
    trolley_x, trolley_y = 470, 36
    angle = 0.07 * math.sin(2 * math.pi * t / DURATION)
    length = 70
    hx = trolley_x + length * math.sin(angle)
    hy = trolley_y + length * math.cos(angle)
    d.rectangle(sc(trolley_x - 6, 36, trolley_x + 6, 42), fill=(90, 96, 110, 255))
    d.line(sc(trolley_x, 42, hx, hy), fill=(70, 76, 90, 255), width=S)
    d.polygon([sc(hx - 12, hy)[0:2], sc(hx + 12, hy)[0:2], sc(hx + 6, hy + 22)[0:2], sc(hx - 6, hy + 22)[0:2]],
              fill=(128, 136, 152, 255))
    d.rectangle(sc(hx - 13, hy - 3, hx + 13, hy + 1), fill=(100, 108, 124, 255))


def draw_worker(d, x, pose, t, arm_offset=0.0):
    """Muhandis: oq kaska, to'q sariq jilet. x — oyoq markazi."""
    g = GROUND
    # oyoqlar va poyabzal
    d.rounded_rectangle(sc(x - 10, g - 46, x - 2, g - 4), radius=3 * S, fill=rgba(TROUSERS))
    d.rounded_rectangle(sc(x + 2, g - 46, x + 10, g - 4), radius=3 * S, fill=rgba(TROUSERS))
    d.rounded_rectangle(sc(x - 12, g - 6, x - 1, g), radius=2 * S, fill=rgba((30, 34, 46)))
    d.rounded_rectangle(sc(x + 1, g - 6, x + 13, g), radius=2 * S, fill=rgba((30, 34, 46)))
    # tana: ko'ylak va jilet
    d.rounded_rectangle(sc(x - 15, g - 92, x + 15, g - 42), radius=7 * S, fill=rgba((58, 76, 128)))
    d.rounded_rectangle(sc(x - 14, g - 90, x + 14, g - 44), radius=6 * S, fill=rgba(VEST))
    for yy in (g - 70, g - 58):
        d.rectangle(sc(x - 14, yy, x + 14, yy + 3), fill=rgba((242, 242, 238)))
    d.line(sc(x, g - 90, x, g - 44), fill=rgba((214, 108, 32)), width=S)
    # bosh va kaska
    hx, hy = x + 2, g - 104
    d.rectangle(sc(hx - 4, hy + 8, hx + 4, hy + 14), fill=rgba(SKIN))
    d.ellipse(sc(hx - 10, hy - 10, hx + 10, hy + 10), fill=rgba(SKIN))
    d.pieslice(sc(hx - 12, hy - 16, hx + 12, hy + 6), 180, 360, fill=rgba(HAT))
    d.rounded_rectangle(sc(hx - 14, hy - 6, hx + 16, hy - 3), radius=S, fill=rgba((226, 228, 234)))

    if pose == "hammer":
        # qo'l ustunga cho'zilgan, qo'lida sklerometr
        sx, sy = x + 8, g - 84
        hand_x, hand_y = x + 34 + arm_offset, g - 76
        d.line(sc(sx, sy, hand_x, hand_y), fill=rgba((58, 76, 128)), width=7 * S)
        d.ellipse(sc(hand_x - 4, hand_y - 4, hand_x + 4, hand_y + 4), fill=rgba(SKIN))
        d.rounded_rectangle(sc(hand_x - 2, hand_y - 5, hand_x + 20, hand_y + 5), radius=3 * S,
                            fill=rgba((52, 58, 72)))
        d.rectangle(sc(hand_x + 20, hand_y - 2, hand_x + 26, hand_y + 2), fill=rgba((120, 126, 140)))
        # ikkinchi qo'l asbobni ushlab turadi
        d.line(sc(x - 6, g - 82, hand_x - 2, hand_y + 4), fill=rgba((58, 76, 128)), width=6 * S)
    else:
        # planshet ushlagan
        d.line(sc(x + 8, g - 84, x + 22, g - 66), fill=rgba((58, 76, 128)), width=6 * S)
        d.line(sc(x - 8, g - 84, x + 10, g - 64), fill=rgba((58, 76, 128)), width=6 * S)
        tb = (x + 10, g - 80, x + 34, g - 62)
        d.rounded_rectangle(sc(*tb), radius=2 * S, fill=rgba((34, 40, 56)))
        glow = 0.6 + 0.4 * math.sin(2 * math.pi * t / 1.25)
        d.rectangle(sc(tb[0] + 3, tb[1] + 3, tb[2] - 3, tb[3] - 3), fill=rgba((92, 150, 245), 0.75 + 0.25 * glow))
        for k, w in enumerate((10, 14, 7)):
            d.rectangle(sc(tb[0] + 5, tb[1] + 6 + k * 4, tb[0] + 5 + w, tb[1] + 7 + k * 4), fill=rgba(WHITE, 0.9))


TAPS = (0.9, 1.5, 2.1, 2.7)
CONTACT = (300, GROUND - 76)


def tap_bump(t):
    return max(max(0.0, 1 - abs(t - tk) / 0.14) for tk in TAPS)


def draw_impacts(d, t):
    for tk in TAPS:
        p = (t - tk) / 0.5
        if 0 <= p <= 1:
            r = 6 + 22 * p
            a = 1 - p
            cx, cy = CONTACT
            d.ellipse(sc(cx - r, cy - r, cx + r, cy + r), outline=rgba((29, 91, 232), a), width=2 * S)


def draw_panel(img, t):
    a = window(t, 0.5)
    if a <= 0:
        return
    dy = int(14 * (1 - a))
    box = (16, 10 + dy, 240, 106 + dy)
    shadow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(sc(box[0], box[1] + 5, box[2], box[3] + 5), radius=14 * S,
                                             fill=rgba(NAVY, 0.25 * a))
    img.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(8 * S)))
    panel = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(panel)
    pd.rounded_rectangle(sc(*box), radius=14 * S, fill=rgba(NAVY, 0.9 * a))
    x0, y0 = box[0] + 16, box[1]
    pd.text(sc(x0, y0 + 9), "BETON MUSTAHKAMLIGI", font=F_BOLD(14), fill=rgba((150, 185, 255), a))
    prog = ease_out((t - 0.9) / 1.9)
    pd.text(sc(x0, y0 + 24), f"{32.4 * prog:.1f}", font=F_BOLD(36), fill=rgba(WHITE, a))
    pd.text(sc(x0 + 86, y0 + 42), "MPa", font=F_REG(17), fill=rgba((200, 214, 245), a))
    pd.rounded_rectangle(sc(x0, y0 + 70, x0 + 192, y0 + 76), radius=3 * S, fill=rgba(WHITE, 0.2 * a))
    pd.rounded_rectangle(sc(x0, y0 + 70, x0 + max(6, int(192 * prog)), y0 + 76), radius=3 * S,
                         fill=rgba((90, 160, 255), a))
    done = window(t, 3.0, 0.35)
    if done > 0:
        pd.text(sc(x0, y0 + 78), "B25 — me’yorga mos", font=F_BOLD(13), fill=rgba((120, 230, 170), a * done))
        cx, cy, r = box[2] - 22, y0 + 40, 11
        pd.ellipse(sc(cx - r, cy - r, cx + r, cy + r), fill=rgba((30, 158, 98), a * done))
        pd.line([sc(cx - 5, cy)[0:2], sc(cx - 1, cy + 4)[0:2], sc(cx + 6, cy - 4)[0:2]],
                fill=rgba(WHITE, a * done), width=3 * S, joint="curve")
    else:
        pd.text(sc(x0, y0 + 78), "O‘lchanmoqda…", font=F_REG(13), fill=rgba((200, 214, 245), a))
    img.alpha_composite(panel)


def frame_construction(t):
    img = BACKGROUND.copy()
    d = ImageDraw.Draw(img)
    draw_clouds(d, t)
    draw_crane_load(d, t)
    draw_impacts(d, t)
    draw_worker(d, 196, "tablet", t)
    draw_worker(d, 250, "hammer", t, arm_offset=-10 * (1 - tap_bump(t)))
    draw_panel(img, t)
    return img.resize((W, H), Image.LANCZOS)
