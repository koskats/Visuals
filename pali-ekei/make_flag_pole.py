"""Ενώνει το "I" του PALI με το "I" του EKEI σε ένα κοντάρι
και βάζει από πάνω σημαία που γράφει "by AMNESIA".

Τρέξιμο:  python3 make_flag_pole.py  ->  pali-ekei-flag-pole.png
"""
import math
import os

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "pali-ekei-original.jpg")
ANTON = os.path.join(HERE, "Anton-Regular.ttf")
MARKER = os.path.join(HERE, "PermanentMarker.ttf")

TEAL = (4, 207, 185)
TEAL_DARK = (3, 150, 135)
BLACK = (8, 8, 8)
WHITE = (255, 255, 255)
SS = 4  # supersampling

# Κοντάρι: ίδιο πλάτος με τα δύο "I" (x 894-946), από το κάτω άκρο του I του EKEI
POLE_L, POLE_R = 894, 946
POLE_TOP, POLE_BOTTOM = 128, 638
OUTLINE = 5

# Σημαία: κυματίζει προς τα αριστερά, πάνω από το "PALI"
FLAG_R = POLE_L          # ενώνεται με το κοντάρι
FLAG_L = 590
FLAG_TOP, FLAG_H = 140, 104
AMP = 12                 # πλάτος κύματος στην ελεύθερη άκρη
NOTCH = 26               # ψαλίδα (swallowtail) στην ελεύθερη άκρη


def s(v):
    return v * SS


def draw_pole(d):
    # Σβήνει την τελεία του πάνω "I" και ό,τι περισσεύει δεξιά από το κοντάρι
    d.rectangle((s(POLE_R), s(274), s(968), s(322)), fill=BLACK)
    # Περίγραμμα + λευκό σώμα (στρογγυλεμένες γωνίες όπως τα γράμματα)
    d.rounded_rectangle((s(POLE_L - OUTLINE), s(POLE_TOP - OUTLINE),
                         s(POLE_R + OUTLINE), s(POLE_BOTTOM + OUTLINE)),
                        radius=s(10), fill=BLACK)
    d.rounded_rectangle((s(POLE_L), s(POLE_TOP), s(POLE_R), s(POLE_BOTTOM)),
                        radius=s(6), fill=WHITE)
    # Κεφαλή (μπίλια) στην κορυφή
    cx, cy, r = (POLE_L + POLE_R) / 2, POLE_TOP - 14, 20
    d.ellipse((s(cx - r - OUTLINE), s(cy - r - OUTLINE),
               s(cx + r + OUTLINE), s(cy + r + OUTLINE)), fill=BLACK)
    d.ellipse((s(cx - r), s(cy - r), s(cx + r), s(cy + r)), fill=WHITE)


def wave_dy(x):
    """Κατακόρυφη μετατόπιση: 0 στο κοντάρι, μέγιστη στην ελεύθερη άκρη."""
    t = (FLAG_R - x) / (FLAG_R - FLAG_L)
    return AMP * t * math.sin(t * 2.2 * math.pi)


def flag_outline(inset=0):
    pts = []
    step = 2
    xs = list(range(FLAG_R - inset, FLAG_L + inset - 1, -step))
    for x in xs:  # πάνω ακμή, από το κοντάρι προς τα έξω
        pts.append((x, FLAG_TOP + inset + wave_dy(x)))
    xl = FLAG_L + inset
    mid = FLAG_TOP + FLAG_H / 2 + wave_dy(xl)
    pts.append((xl + NOTCH - inset * 0.4, mid))  # ψαλίδα
    for x in reversed(xs):  # κάτω ακμή, πίσω στο κοντάρι
        pts.append((x, FLAG_TOP + FLAG_H - inset + wave_dy(x)))
    return [(s(x), s(y)) for x, y in pts]


def draw_flag(layer):
    d = ImageDraw.Draw(layer)
    d.polygon(flag_outline(-OUTLINE), fill=BLACK)
    d.polygon(flag_outline(0), fill=TEAL)

    # Σκίαση στις "κοιλάδες" του κύματος για αίσθηση υφάσματος
    shade = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for x in range(FLAG_L, FLAG_R):
        t = (FLAG_R - x) / (FLAG_R - FLAG_L)
        slope = math.cos(t * 2.2 * math.pi)
        a = int(max(0, -slope) * 70 * t)
        if a:
            sd.rectangle((s(x), 0, s(x + 1), layer.height), fill=TEAL_DARK + (a,))
    mask = Image.new("L", layer.size, 0)
    ImageDraw.Draw(mask).polygon(flag_outline(0), fill=255)
    shade.putalpha(Image.composite(shade.getchannel("A"), Image.new("L", layer.size, 0), mask))
    layer.alpha_composite(shade)

    # Κείμενο σε επίπεδο layer, μετά παραμορφώνεται στήλη-στήλη με το κύμα
    by = ImageFont.truetype(MARKER, s(30))
    am = ImageFont.truetype(ANTON, s(64))
    fw, fh = s(FLAG_R - FLAG_L - NOTCH), s(FLAG_H)
    flat = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
    fd = ImageDraw.Draw(flat)
    bb_by = fd.textbbox((0, 0), "by", font=by)
    bb_am = fd.textbbox((0, 0), "AMNESIA", font=am)
    gap = s(10)
    total = (bb_by[2] - bb_by[0]) + gap + (bb_am[2] - bb_am[0])
    x = (fw - total) / 2
    am_y = (fh - (bb_am[3] - bb_am[1])) / 2 - bb_am[1]
    by_y = am_y + bb_am[3] - bb_by[3] - s(4)
    fd.text((x - bb_by[0], by_y), "by", font=by, fill=BLACK)
    fd.text((x + (bb_by[2] - bb_by[0]) + gap - bb_am[0], am_y), "AMNESIA", font=am, fill=BLACK)

    x0 = s(FLAG_L + NOTCH)
    for cx in range(fw):
        X = x0 + cx
        dy = wave_dy(X / SS)
        layer.alpha_composite(flat.crop((cx, 0, cx + 1, fh)), (X, int(s(FLAG_TOP + dy))))


def main():
    base = Image.open(SRC).convert("RGBA")
    W, H = base.size
    big = Image.new("RGBA", (s(W), s(H)), (0, 0, 0, 0))
    draw_pole(ImageDraw.Draw(big))
    flag = Image.new("RGBA", big.size, (0, 0, 0, 0))
    draw_flag(flag)
    big.alpha_composite(flag)
    art = big.resize((W, H), Image.LANCZOS)

    # Απαλή σκιά μόνο για τη σημαία/κεφαλή που πέφτουν πάνω στο μωβ
    sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sh.putalpha(art.getchannel("A").point(lambda a: a * 0.35))
    sh = sh.filter(ImageFilter.GaussianBlur(5))
    out = base.copy()
    out.alpha_composite(sh, (4, 6))
    out.alpha_composite(art)
    out.convert("RGB").save(os.path.join(HERE, "pali-ekei-flag-pole.png"))
    print("ok")


if __name__ == "__main__":
    main()
