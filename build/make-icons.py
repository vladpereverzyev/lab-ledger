#!/usr/bin/env python3
"""Rasterize the Lab Ledger mark into every icon size the project ships.

The geometry below was measured pixel by pixel on the 2048 px master artwork
and divided by 8, so this file and icon.svg draw exactly the same shape at the
same proportions. Pillow is the only dependency - no SVG engine needed.

    python -m pip install pillow
    python build/make-icons.py

Outputs:
    build/icon.ico  multi-size Windows icon (16 -> 256), used by electron-builder
    build/icon.png  1024 px, used for the macOS (.icns) and Linux builds
    src/assets/     the same mark as app/web assets: favicon.ico, icon.svg and
                    icon-32/180/192/256/512.png (shipped inside the app,
                    so the packaged build and the browser demo share one set)
"""

import os
import shutil
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "src", "assets")

# --- geometry, in the 256-unit space of icon.svg (master / 8) -------------
BG = (10, 10, 10, 255)           # #0a0a0a, as in the master
CORNER = 48.0                    # rounded corners of the black tile
FG = (255, 255, 255, 255)
T = 23.0                         # stroke weight
R = T / 2                        # round cap / foot radius
FILLET = 4.25                    # small fillet inside the corner of the L

STEM_X = 69.0 + R                # centre line of the vertical of the L
TOP_Y = 53.75 + R                # centre of the top cap
FOOT_Y = 202.25 - R              # centre of the foot
BAR_X0 = 100.625 + R             # centre of the left cap of the ledger lines
BAR_X1 = 186.875 - R             # centre of their right cap
MID_Y = 116.5 + R                # centre of the middle ledger line

ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
PNG_SIZES = [32, 180, 192, 256, 512]   # the sizes index.html and the README link
SUPERSAMPLE = 8


def draw_mark(size):
    """Render the mark at `size` px, supersampled then downscaled."""
    s = size * SUPERSAMPLE
    k = s / 256.0
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, s - 1, s - 1], radius=CORNER * k, fill=BG)
    r = R * k

    def cap(x, y):
        d.ellipse([x * k - r, y * k - r, x * k + r, y * k + r], fill=FG)

    def bar(x0, y0, x1, y1):
        if y0 == y1:
            d.rectangle([x0 * k, y0 * k - r, x1 * k, y1 * k + r], fill=FG)
        else:
            d.rectangle([x0 * k - r, y0 * k, x1 * k + r, y1 * k], fill=FG)
        cap(x0, y0)
        cap(x1, y1)

    bar(STEM_X, TOP_Y, STEM_X, FOOT_Y)     # vertical of the L
    bar(STEM_X, FOOT_Y, BAR_X1, FOOT_Y)    # foot of the L / bottom ledger line
    bar(BAR_X0, TOP_Y, BAR_X1, TOP_Y)      # top ledger line
    bar(BAR_X0, MID_Y, BAR_X1, MID_Y)      # middle ledger line

    # Inner corner of the L: fill the small square the two bars leave open,
    # then bite a disc out of it so the corner turns instead of breaking at 90.
    fx, fy = STEM_X + R, FOOT_Y - R - FILLET
    d.rectangle([fx * k, fy * k, (fx + FILLET) * k, (fy + FILLET) * k], fill=FG)
    d.ellipse([fx * k, (fy - FILLET) * k,
               (fx + 2 * FILLET) * k, (fy + FILLET) * k], fill=BG)

    return img.convert("RGBA").resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(ASSETS, exist_ok=True)
    cache = {}
    for s in sorted(set(ICO_SIZES + PNG_SIZES + [1024])):
        cache[s] = draw_mark(s)

    for s in PNG_SIZES:
        cache[s].save(os.path.join(ASSETS, f"icon-{s}.png"))
    cache[1024].save(os.path.join(HERE, "icon.png"))

    for target in (os.path.join(HERE, "icon.ico"), os.path.join(ASSETS, "favicon.ico")):
        cache[256].save(
            target,
            format="ICO",
            sizes=[(s, s) for s in ICO_SIZES],
            append_images=[cache[s] for s in ICO_SIZES if s != 256],
        )
    shutil.copyfile(os.path.join(HERE, "icon.svg"), os.path.join(ASSETS, "icon.svg"))
    print("wrote build/icon.ico, build/icon.png and %d assets in src/assets/" % (len(PNG_SIZES) + 2))


if __name__ == "__main__":
    main()
