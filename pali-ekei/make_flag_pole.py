"""PALI EKEI: τα δύο "I" (του PALI και του EKEI) γίνονται ένα κοντάρι
με σημαία "by AMNESIA", στο ίδιο graffiti/spray ύφος με τον τίτλο.

Τρέξιμο:  python3 make_flag_pole.py  ->  pali-ekei-flag-pole.png
"""
import math
import os

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "pali-ekei-original.jpg")
ANTON = os.path.join(HERE, "Anton-Regular.ttf")
OUT = os.path.join(HERE, "pali-ekei-flag-pole.png")

TEAL = np.array([4, 207, 185])
TEAL_LIGHT = np.array([70, 236, 214])
TEAL_DARK = np.array([2, 140, 128])
INK = (10, 10, 10)
WHITE = (250, 250, 248)
SS = 4
rng = np.random.default_rng(11)

# --- Γεωμετρία (σε pixels του 1080x1080) -------------------------------------
POLE_L, POLE_R = 896, 942          # πλάτος ίδιο με τα "I"
POLE_BOTTOM = 638                  # κάτω άκρο του "I" του EKEI
POLE_TOP = 104
KNOB_R = 15

FLAG_R = POLE_L + 4                # ραμμένη στο κοντάρι
FLAG_L = 604
FLAG_TOP, FLAG_H = 120, 100
NOTCH = 30
WAVES = 1.6                        # πόσα "κύματα" έχει το ύφασμα
AMP = 11


def t_of(x):
    return (FLAG_R - x) / (FLAG_R - FLAG_L)


def dy(x):
    """Κυμάτισμα: 0 στο κοντάρι, μεγαλώνει προς την ελεύθερη άκρη."""
    t = t_of(x)
    return AMP * (0.25 + 0.75 * t) * math.sin(t * WAVES * 2 * math.pi)


def slope(x):
    t = t_of(x)
    return math.cos(t * WAVES * 2 * math.pi) * (0.25 + 0.75 * t)


# --- Σχήματα -------------------------------------------------------------------
def wobble(n, amp):
    """Ελαφριά "χειροποίητη" ανωμαλία στις άκρες, σαν τα γράμματα."""
    v = rng.normal(0, 1, n)
    v = np.convolve(v, np.ones(5) / 5, mode="same")
    return v * amp


def pole_polygon():
    ys = np.arange(POLE_TOP, POLE_BOTTOM + 1, 6)
    wl, wr = wobble(len(ys), 1.4), wobble(len(ys), 1.4)
    left = [(POLE_L + wl[i], y) for i, y in enumerate(ys)]
    right = [(POLE_R + wr[i], y) for i, y in enumerate(ys)][::-1]
    return left + right


def flag_polygon(inset=0.0):
    xs = np.arange(FLAG_R, FLAG_L - 1, -3, dtype=float)
    top = [(x, FLAG_TOP + inset + dy(x)) for x in xs]
    bot = [(x, FLAG_TOP + FLAG_H - inset + dy(x)) for x in xs[::-1]]
    xl = FLAG_L
    notch = (xl + NOTCH, FLAG_TOP + FLAG_H / 2 + dy(xl))
    return top + [notch] + bot


def scaled(pts):
    return [(x * SS, y * SS) for x, y in pts]


# --- Καθαρισμός πρωτοτύπου ----------------------------------------------------
def clean_base(img):
    """Σβήνει την τελεία του πάνω "I" (θα γίνει κοντάρι) και τις
    λευκές λεπτές γραμμές-ατέλειες στη δεξιά άκρη του κύκλου."""
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    a = bgr.astype(int).sum(-1)
    mask = np.zeros(a.shape, np.uint8)
    for x0, x1 in ((1005, 1025), (1065, 1080)):
        sub = a[280:600, x0:x1] > 600
        mask[280:600, x0:x1][sub] = 255
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
    bgr = cv2.inpaint(bgr, mask, 5, cv2.INPAINT_TELEA)
    out = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    # Τα λευκά pixels της τελείας του "Ī" και των δύο "I" γίνονται μαύρα,
    # ώστε να μείνει άθικτο το ακανόνιστο περίγραμμα του spray φόντου.
    arr = np.array(out)
    region = np.zeros(a.shape, np.uint8)
    region[272:330, POLE_L - 6:975] = 1
    region[330:645, POLE_L - 6:POLE_R + 8] = 1
    white = ((arr.astype(int).sum(-1) > 330) & (region > 0)).astype(np.uint8)
    white = cv2.dilate(white, np.ones((3, 3), np.uint8), iterations=2) & region
    arr[white > 0] = INK
    return Image.fromarray(arr)


# --- Μαύρο spray φόντο πίσω από κοντάρι και σημαία -----------------------------
def spray_backdrop(size, base):
    W, H = size
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.polygon(flag_polygon(), fill=255)
    d.rectangle((POLE_L, POLE_TOP, POLE_R, 300), fill=255)
    cx = (POLE_L + POLE_R) / 2
    d.ellipse((cx - KNOB_R, POLE_TOP - 2 * KNOB_R + 4, cx + KNOB_R, POLE_TOP + 4), fill=255)
    m = np.array(m.filter(ImageFilter.MaxFilter(23))).astype(float) / 255

    # οργανική άκρη: θόλωμα + θόρυβος + κατώφλι
    soft = cv2.GaussianBlur(m, (0, 0), 6)
    noise = cv2.GaussianBlur(rng.random((H, W)), (0, 0), 3)
    noise = (noise - noise.mean()) / noise.std()
    body = (soft + noise * 0.09) > 0.5

    # ψεκασμός: σταγονίδια που αραιώνουν όσο απομακρύνονται
    halo = cv2.GaussianBlur(m, (0, 0), 10)
    specks = rng.random((H, W)) < (halo * 0.10) ** 1.6
    big = rng.random((H, W)) < (halo * 0.010)
    specks = cv2.dilate(specks.astype(np.uint8), np.ones((2, 2), np.uint8)) > 0
    big = cv2.dilate(big.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))) > 0

    # όχι στίγματα πάνω στη μέδουσα
    px = np.array(base.convert("RGB")).astype(int)
    teal = (px[..., 1] > 150) & (px[..., 0] < 90)
    teal = cv2.dilate(teal.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    alpha = ((body | specks | big) & ~teal).astype(np.uint8) * 255
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.6)
    layer = Image.new("RGBA", size, INK + (0,))
    layer.putalpha(Image.fromarray(alpha))
    return layer


# --- Κοντάρι ---------------------------------------------------------------------
def draw_pole(layer):
    d = ImageDraw.Draw(layer)
    d.polygon(scaled(pole_polygon()), fill=WHITE)
    # στρογγυλεμένες άκρες
    for y in (POLE_TOP, POLE_BOTTOM):
        d.ellipse((POLE_L * SS, (y - 4) * SS, POLE_R * SS, (y + 4) * SS), fill=WHITE)
    cx = (POLE_L + POLE_R) / 2
    cy = POLE_TOP - KNOB_R + 4
    d.ellipse(((cx - KNOB_R) * SS, (cy - KNOB_R) * SS,
               (cx + KNOB_R) * SS, (cy + KNOB_R) * SS), fill=WHITE)
    # λεπτό μαύρο "λαιμό" ανάμεσα σε κεφαλή και κοντάρι
    d.rectangle(((POLE_L - 2) * SS, (POLE_TOP + 3) * SS,
                 (POLE_R + 2) * SS, (POLE_TOP + 7) * SS), fill=INK)
    # λίγα μαύρα στίγματα όπως στα γράμματα του τίτλου
    for _ in range(9):
        x = rng.uniform(POLE_L + 6, POLE_R - 6)
        y = rng.uniform(POLE_TOP + 20, POLE_BOTTOM - 10)
        r = rng.uniform(0.8, 1.8)
        d.ellipse(((x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS), fill=INK)


# --- Σημαία ------------------------------------------------------------------
def draw_flag(layer):
    W, H = layer.size
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(scaled(flag_polygon()), fill=255)

    # χρώμα με σκιές στις πτυχές
    cols = np.zeros((W, 3))
    for X in range(FLAG_L * SS, FLAG_R * SS + 1):
        s = slope(X / SS)
        c = TEAL + (TEAL_DARK - TEAL) * max(0, s) * 0.9 + (TEAL_LIGHT - TEAL) * max(0, -s) * 0.8
        cols[X] = c
    # σκιά δίπλα στο κοντάρι
    for X in range((FLAG_R - 14) * SS, FLAG_R * SS + 1):
        k = (X / SS - (FLAG_R - 14)) / 14
        cols[X] = cols[X] * (1 - 0.35 * k) + TEAL_DARK * 0.35 * k
    rgb = np.broadcast_to(cols[None, :, :], (H, W, 3)).astype(np.uint8)
    cloth = Image.fromarray(np.ascontiguousarray(rgb)).convert("RGBA")
    cloth.putalpha(mask)

    # κείμενο σε επίπεδο layer, μετά "δένεται" στο κύμα στήλη-στήλη
    am = ImageFont.truetype(ANTON, 66 * SS)
    by = ImageFont.truetype(ANTON, 26 * SS)
    fw, fh = (FLAG_R - FLAG_L - NOTCH - 16) * SS, FLAG_H * SS
    flat = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    fd = ImageDraw.Draw(flat)
    by_txt = "BY"
    bb_by = fd.textbbox((0, 0), by_txt, font=by)
    bb_am = fd.textbbox((0, 0), "AMNESIA", font=am)
    gap = 9 * SS
    tw = (bb_by[2] - bb_by[0]) + gap + (bb_am[2] - bb_am[0])
    x = (fw - tw) / 2
    am_y = (fh - (bb_am[3] - bb_am[1])) / 2 - bb_am[1] + 2 * SS
    by_y = am_y + bb_am[1] - bb_by[1]  # ίδιο πάνω ύψος (cap line)
    fd.text((x - bb_by[0], by_y), by_txt, font=by, fill=INK)
    fd.text((x + (bb_by[2] - bb_by[0]) + gap - bb_am[0], am_y), "AMNESIA", font=am, fill=INK)

    x0 = (FLAG_L + NOTCH) * SS
    for cx in range(fw):
        X = x0 + cx
        cloth.alpha_composite(flat.crop((cx, 0, cx + 1, fh)), (X, int((FLAG_TOP + dy(X / SS)) * SS)))

    # υφή spray: μικρά στίγματα όπως στη μέδουσα
    sd = ImageDraw.Draw(cloth)
    for _ in range(160):
        X = rng.uniform(FLAG_L + NOTCH * 0.6, FLAG_R - 4)
        Y = FLAG_TOP + dy(X) + rng.uniform(4, FLAG_H - 4)
        r = rng.uniform(0.5, 1.5)
        sd.ellipse(((X - r) * SS, (Y - r) * SS, (X + r) * SS, (Y + r) * SS), fill=INK + (255,))
    clip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    clip.paste(cloth, (0, 0), mask)
    layer.alpha_composite(clip)


def main():
    base = clean_base(Image.open(SRC).convert("RGB")).convert("RGBA")
    W, H = base.size
    base.alpha_composite(spray_backdrop((W, H), base))

    art = Image.new("RGBA", (W * SS, H * SS), (0, 0, 0, 0))
    draw_flag(art)
    draw_pole(art)
    base.alpha_composite(art.resize((W, H), Image.LANCZOS))
    base.convert("RGB").save(OUT)
    print("ok")


if __name__ == "__main__":
    main()
