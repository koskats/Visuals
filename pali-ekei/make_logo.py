"""Αντικαθιστά το "amplified by mercury rent a car" του PALI EKEI logo με "by AMNESIA".

Βγάζει δύο εκδοχές:
  pali-ekei-by-amnesia-spray.png  -> μαύρο spray-paint patch (στο στυλ του τίτλου)
  pali-ekei-by-amnesia-flag.png   -> κυματιστή σημαία/κορδέλα στο τιρκουάζ της μέδουσας

Τρέξιμο:  python3 make_logo.py
"""
import math
import os
import random

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "pali-ekei-original.jpg")
ANTON = os.path.join(HERE, "Anton-Regular.ttf")
MARKER = os.path.join(HERE, "PermanentMarker.ttf")

TEAL = (4, 207, 185)
BLACK = (8, 8, 8)
WHITE = (255, 255, 255)

# Περιοχή του χορηγού (mercury badge) στο 1080x1080 πρωτότυπο
BOX = (515, 800, 885, 960)
SS = 4  # supersampling για ομαλές άκρες


def remove_sponsor(base):
    """Σβήνει το λευκό/ροζ "amplified by mercury rent a car" με inpainting,
    ώστε να μείνουν μόνο οι φοίνικες και το μωβ φόντο."""
    im = cv2.cvtColor(np.array(base), cv2.COLOR_RGB2BGR)
    x0, y0, x1, y1 = 530, 800, 870, 960
    reg = im[y0:y1, x0:x1].astype(int)
    b, g, r = reg[..., 0], reg[..., 1], reg[..., 2]
    bright = reg.sum(-1)
    m = ((bright > 420) | ((r > g + 40) & (r > b - 60) & (bright > 200))).astype(np.uint8) * 255
    m = cv2.dilate(m, np.ones((5, 5), np.uint8), iterations=2)
    full = np.zeros(im.shape[:2], np.uint8)
    full[y0:y1, x0:x1] = m
    out = cv2.inpaint(im, full, 7, cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(out, cv2.COLOR_BGR2RGB))


def text_layer(size, lines, color, stroke=0, stroke_color=None):
    """Ζωγραφίζει κεντραρισμένες γραμμές [(text, font, gap)] σε διάφανο layer."""
    w, h = size
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    boxes = [d.textbbox((0, 0), t, font=f, stroke_width=stroke) for t, f, _ in lines]
    total = sum(b[3] - b[1] for b in boxes) + sum(g for _, _, g in lines[1:])
    y = (h - total) / 2
    for (t, f, g), b in zip(lines, boxes):
        if y != (h - total) / 2:
            y += g
        x = (w - (b[2] - b[0])) / 2 - b[0]
        d.text((x, y - b[1]), t, font=f, fill=color,
               stroke_width=stroke, stroke_fill=stroke_color)
        y += b[3] - b[1]
    return layer


def spray_version(base):
    rnd = random.Random(7)
    x0, y0, x1, y1 = BOX
    W, H = (x1 - x0 + 120) * SS, (y1 - y0 + 140) * SS
    ox, oy = (x0 - 60), (y0 - 50)
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    cx0, cy0, cx1, cy1 = 60 * SS, 50 * SS, (x1 - x0 + 60) * SS, (y1 - y0 + 50) * SS

    # Σώμα: πολλά επικαλυπτόμενα blobs για ακανόνιστο περίγραμμα
    d.rounded_rectangle((cx0 + 10 * SS, cy0 + 8 * SS, cx1 - 10 * SS, cy1 - 8 * SS),
                        radius=18 * SS, fill=255)
    for _ in range(140):
        t = rnd.random()
        side = rnd.randrange(4)
        if side == 0:
            px, py = cx0 + t * (cx1 - cx0), cy0 + rnd.uniform(0, 14) * SS
        elif side == 1:
            px, py = cx0 + t * (cx1 - cx0), cy1 - rnd.uniform(0, 14) * SS
        elif side == 2:
            px, py = cx0 + rnd.uniform(0, 14) * SS, cy0 + t * (cy1 - cy0)
        else:
            px, py = cx1 - rnd.uniform(0, 14) * SS, cy0 + t * (cy1 - cy0)
        r = rnd.uniform(6, 16) * SS
        d.ellipse((px - r, py - r, px + r, py + r), fill=255)

    # Ψεκασμός γύρω-γύρω
    for _ in range(2600):
        ang = rnd.uniform(0, 2 * math.pi)
        mx, my = (cx0 + cx1) / 2, (cy0 + cy1) / 2
        rx, ry = (cx1 - cx0) / 2, (cy1 - cy0) / 2
        k = 1 + abs(rnd.gauss(0, 0.12))
        px, py = mx + math.cos(ang) * rx * k, my + math.sin(ang) * ry * k
        r = rnd.uniform(0.6, 2.4) * SS
        d.ellipse((px - r, py - r, px + r, py + r), fill=255)

    # Σταγόνες (drips) προς τα κάτω
    for _ in range(6):
        px = rnd.uniform(cx0 + 30 * SS, cx1 - 30 * SS)
        ln = rnd.uniform(15, 55) * SS
        wd = rnd.uniform(2.5, 5) * SS
        d.rounded_rectangle((px - wd, cy1 - 20 * SS, px + wd, cy1 + ln), radius=wd, fill=255)
        d.ellipse((px - wd * 1.4, cy1 + ln - wd * 1.4, px + wd * 1.4, cy1 + ln + wd * 1.4), fill=255)

    mask = mask.resize((W // SS, H // SS), Image.LANCZOS)
    patch = Image.new("RGBA", mask.size, BLACK + (255,))
    patch.putalpha(mask)

    out = base.convert("RGBA")
    out.alpha_composite(patch, (ox, oy))

    by = ImageFont.truetype(MARKER, 34 * SS)
    am = ImageFont.truetype(ANTON, 92 * SS)
    tl = text_layer(((x1 - x0) * SS, (y1 - y0) * SS),
                    [("by", by, 0), ("AMNESIA", am, 6 * SS)], WHITE)
    tl = tl.resize((x1 - x0, y1 - y0), Image.LANCZOS)
    out.alpha_composite(tl, (x0, y0 - 2))
    return out.convert("RGB")


def flag_version(base):
    x0, y0, x1, y1 = BOX
    # Καμβάς λίγο μεγαλύτερος για τις ουρές της κορδέλας
    pad = 40
    W, H = (x1 - x0 + 2 * pad) * SS, (y1 - y0 + 2 * pad) * SS
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    band_h = 92 * SS
    amp = 9 * SS
    left, right = (pad + 30) * SS, W - (pad + 30) * SS
    mid_y = H / 2

    def wave(x):
        return mid_y + amp * math.sin((x - left) / (right - left) * 2 * math.pi)

    def band_poly(xa, xb, h, dy=0):
        top = [(x, wave(x) - h / 2 + dy) for x in range(int(xa), int(xb) + 1, SS)]
        bot = [(x, wave(x) + h / 2 + dy) for x in range(int(xb), int(xa) - 1, -SS)]
        return top + bot

    outline = 6 * SS
    tail_w = 52 * SS
    tail_h = band_h * 0.82
    drop = 22 * SS

    # Ουρές (πίσω κομμάτια με ψαλιδωτή άκρη)
    for side in (-1, 1):
        if side < 0:
            xi, xo = left + 18 * SS, left - tail_w
        else:
            xi, xo = right - 18 * SS, right + tail_w
        yc = wave(xi) + drop
        notch = 22 * SS * side
        tail = [(xi, yc - tail_h / 2), (xo, yc - tail_h / 2),
                (xo - notch, yc), (xo, yc + tail_h / 2), (xi, yc + tail_h / 2)]
        d.polygon(tail, fill=BLACK)
        shrink = [(xi, yc - tail_h / 2 + outline), (xo - outline * side, yc - tail_h / 2 + outline),
                  (xo - notch - outline * side * 0.2, yc), (xo - outline * side, yc + tail_h / 2 - outline),
                  (xi, yc + tail_h / 2 - outline)]
        d.polygon(shrink, fill=(3, 150, 135))
        # σκιώδες τρίγωνο-δίπλωμα που ενώνει ουρά και κορδέλα
        fold_x = left if side < 0 else right
        fold = [(fold_x, wave(fold_x) + band_h / 2 - outline),
                (fold_x, wave(fold_x) + band_h / 2 + drop - outline),
                (fold_x - 18 * SS * side, wave(fold_x) + band_h / 2 - outline)]
        d.polygon(fold, fill=BLACK)

    # Κύρια κορδέλα
    d.polygon(band_poly(left, right, band_h + 2 * outline), fill=BLACK)
    d.polygon(band_poly(left + outline, right - outline, band_h), fill=TEAL)

    # Κείμενο, παραμορφωμένο κατά το κύμα (στήλη-στήλη)
    by = ImageFont.truetype(MARKER, 30 * SS)
    am = ImageFont.truetype(ANTON, 66 * SS)
    tw = int(right - left)
    flat = Image.new("RGBA", (tw, int(band_h)), (0, 0, 0, 0))
    fd = ImageDraw.Draw(flat)
    bb_by = fd.textbbox((0, 0), "by", font=by)
    bb_am = fd.textbbox((0, 0), "AMNESIA", font=am)
    gap = 12 * SS
    total_w = (bb_by[2] - bb_by[0]) + gap + (bb_am[2] - bb_am[0])
    sx = (tw - total_w) / 2
    am_y = (band_h - (bb_am[3] - bb_am[1])) / 2 - bb_am[1]
    by_y = am_y + bb_am[3] - bb_by[3] - 4 * SS  # baseline-ish ευθυγράμμιση
    fd.text((sx - bb_by[0], by_y), "by", font=by, fill=BLACK)
    fd.text((sx + (bb_by[2] - bb_by[0]) + gap - bb_am[0], am_y), "AMNESIA", font=am, fill=BLACK)

    for cx in range(tw):
        col = flat.crop((cx, 0, cx + 1, flat.height))
        X = int(left) + cx
        layer.alpha_composite(col, (X, int(wave(X) - band_h / 2)))

    layer = layer.resize((W // SS, H // SS), Image.LANCZOS)
    # απαλή σκιά για βάθος
    shadow = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    shadow.putalpha(layer.getchannel("A").point(lambda a: a * 0.45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(5))

    out = base.convert("RGBA")
    out.alpha_composite(shadow, (x0 - pad + 4, y0 - pad + 6))
    out.alpha_composite(layer, (x0 - pad, y0 - pad))
    return out.convert("RGB")


if __name__ == "__main__":
    base = remove_sponsor(Image.open(SRC).convert("RGB"))
    spray_version(base).save(os.path.join(HERE, "pali-ekei-by-amnesia-spray.png"))
    flag_version(base).save(os.path.join(HERE, "pali-ekei-by-amnesia-flag.png"))
    print("ok")
