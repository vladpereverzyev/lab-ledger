#!/usr/bin/env python3
"""Rasterize the Lab Ledger Dental mark into every icon size the project ships.

The geometry below was measured pixel by pixel on the 2048 px master artwork
and divided by 8. The mark comes in two variants drawn from that one shape:
light (a white to soft grey tile with a graphite mark, the default) and dark
(the original black tile with a white mark). The SVGs are written from the
same numbers, so they cannot drift from the PNGs. Pillow is the only
dependency - no SVG engine needed.

    python -m pip install pillow
    python build/make-icons.py

Outputs:
    build/icon.ico   multi-size Windows icon (16 -> 256), light
    build/icon.png   1024 px, the tile filling the canvas, used for the macOS
                     (.icns) and Linux builds, light
    build/icon.svg, build/icon-light.svg, build/icon-dark.svg
    build/appx/      Microsoft Store tiles, light
    src/assets/      favicon.ico, icon.svg and icon-32/180/192/256/512.png
                     (light, shared by the app and the browser demo),
                     apple-touch-icon.png and icon-maskable-512.png (full
                     squares for iOS and Android home screens), plus
                     icon-light-512.png and icon-dark-512.png (window and
                     taskbar) and icon-light-mac.png and icon-dark-mac.png
                     (Dock), the two icons the user can pick from in Settings
"""

import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(HERE, "..", "src", "assets")

# --- geometry, in the 256-unit space of icon.svg (master / 8) -------------
CORNER = 48.0                    # rounded corners of the tile
T = 23.0                         # stroke weight
R = T / 2                        # round cap / foot radius
FILLET = 4.25                    # small fillet inside the corner of the L

STEM_X = 69.0 + R                # centre line of the vertical of the L
TOP_Y = 53.75 + R                # centre of the top cap
FOOT_Y = 202.25 - R              # centre of the foot
BAR_X0 = 100.625 + R             # centre of the left cap of the ledger lines
BAR_X1 = 186.875 - R             # centre of their right cap
MID_Y = 116.5 + R                # centre of the middle ledger line

# How big the mark sits in its tile, scaled around the centre. 1 is the
# master's own proportion, the one the artwork was drawn and approved with.
MARK_SCALE = 1.0

# Each variant: tile gradient top -> bottom, a hairline edge (or None) and the
# mark's own gradient top -> bottom.
VARIANTS = {
    "light": ((255, 255, 255), (242, 242, 247), (209, 209, 214), (142, 142, 147), (142, 142, 147)),
    "dark": ((10, 10, 10), (10, 10, 10), None, (255, 255, 255), (255, 255, 255)),
}
DEFAULT = "light"

ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]
PNG_SIZES = [32, 180, 192, 256, 512]   # the sizes index.html and the README link
SUPERSAMPLE = 8

# The macOS icon fills its whole 1024 canvas, as the original artwork did: with
# Apple's 824 px grid and a transparent margin it showed shrunken in App
# Store Connect and on the store page.
MAC_CANVAS, MAC_TILE = 1024, 1024

# Microsoft Store tiles: name -> (width, height, mark size).
APPX_TILES = {
    "StoreLogo": (50, 50, 50),
    "Square44x44Logo": (44, 44, 44),
    "Square150x150Logo": (150, 150, 100),
    "Wide310x150Logo": (310, 150, 100),
}


def m(v):
    """A coordinate of the mark, scaled around the centre of the tile."""
    return 128 + (v - 128) * MARK_SCALE


def vgradient(s, top, bottom):
    """An s x s image fading from `top` to `bottom`, top to bottom."""
    g = Image.new("RGBA", (1, s))
    for y in range(s):
        t = y / max(1, s - 1)
        g.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(top, bottom)) + (255,))
    return g.resize((s, s))


def draw_mark(size, variant=DEFAULT):
    """Render the icon at `size` px, supersampled then downscaled."""
    top, bottom, edge, fg_top, fg_bottom = VARIANTS[variant]
    s = size * SUPERSAMPLE
    k = s / 256.0

    # The tile: a vertical gradient cut to the rounded square.
    tile = Image.new("L", (s, s), 0)
    ImageDraw.Draw(tile).rounded_rectangle([0, 0, s - 1, s - 1], radius=CORNER * k, fill=255)
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    img.paste(vgradient(s, top, bottom), (0, 0), tile)
    if edge:
        ImageDraw.Draw(img).rounded_rectangle([0, 0, s - 1, s - 1], radius=CORNER * k,
                                              outline=edge + (255,), width=max(1, round(k)))

    # The mark is drawn as a mask, then filled with its own gradient.
    mark = Image.new("L", (s, s), 0)
    d = ImageDraw.Draw(mark)
    r = R * MARK_SCALE * k

    def cap(x, y):
        d.ellipse([m(x) * k - r, m(y) * k - r, m(x) * k + r, m(y) * k + r], fill=255)

    def bar(x0, y0, x1, y1):
        if y0 == y1:
            d.rectangle([m(x0) * k, m(y0) * k - r, m(x1) * k, m(y1) * k + r], fill=255)
        else:
            d.rectangle([m(x0) * k - r, m(y0) * k, m(x1) * k + r, m(y1) * k], fill=255)
        cap(x0, y0)
        cap(x1, y1)

    bar(STEM_X, TOP_Y, STEM_X, FOOT_Y)     # vertical of the L
    bar(STEM_X, FOOT_Y, BAR_X1, FOOT_Y)    # foot of the L / bottom ledger line
    bar(BAR_X0, TOP_Y, BAR_X1, TOP_Y)      # top ledger line
    bar(BAR_X0, MID_Y, BAR_X1, MID_Y)      # middle ledger line

    # Inner corner of the L: fill the small square the two bars leave open,
    # then bite a disc out of it so the corner turns instead of breaking at 90.
    f = FILLET * MARK_SCALE
    fx, fy = m(STEM_X) + R * MARK_SCALE, m(FOOT_Y) - R * MARK_SCALE - f
    d.rectangle([fx * k, fy * k, (fx + f) * k, (fy + f) * k], fill=255)
    d.ellipse([fx * k, (fy - f) * k, (fx + 2 * f) * k, (fy + f) * k], fill=0)

    img.paste(vgradient(s, fg_top, fg_bottom), (0, 0), mark)
    return img.resize((size, size), Image.LANCZOS)


def draw_square(size, variant=DEFAULT):
    """The icon as a full, opaque square with no rounded corners: iOS rounds
    home-screen icons itself and Android crops "maskable" ones to its own
    shape, so both want the tile colour right to the edges."""
    s = size * SUPERSAMPLE
    saved = CORNER
    globals()["CORNER"] = 0.0
    top, bottom, _edge, fg_top, fg_bottom = VARIANTS[variant]
    VARIANTS["_square"] = (top, bottom, None, fg_top, fg_bottom)
    try:
        img = draw_mark(size, "_square")
    finally:
        globals()["CORNER"] = saved
        del VARIANTS["_square"]
    return img


def svg(variant):
    """The same icon as an SVG, from the same numbers."""
    top, bottom, edge, fg_top, fg_bottom = VARIANTS[variant]
    hexc = lambda c: "#%02x%02x%02x" % c
    S = MARK_SCALE
    edge_attr = ' stroke="%s" stroke-width="1"' % hexc(edge) if edge else ""
    x0, xr = 69.0, 92.0
    return f'''<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- Lab Ledger Dental mark, {variant} variant: an "L" whose three ledger lines
       also read as an "E". Written by build/make-icons.py - edit that file,
       not this one. -->
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{hexc(top)}"/>
      <stop offset="1" stop-color="{hexc(bottom)}"/>
    </linearGradient>
    <linearGradient id="mark" gradientUnits="userSpaceOnUse" x1="0" y1="{128 - 128 / S:g}" x2="0" y2="{128 + 128 / S:g}">
      <stop offset="0" stop-color="{hexc(fg_top)}"/>
      <stop offset="1" stop-color="{hexc(fg_bottom)}"/>
    </linearGradient>
  </defs>
  <rect x="0.5" y="0.5" width="255" height="255" rx="48" fill="url(#tile)"{edge_attr}/>
  <g fill="url(#mark)" transform="translate(128 128) scale({S}) translate(-128 -128)">
    <path d="M{x0} 65.25
             A11.5 11.5 0 0 1 {xr} 65.25
             L{xr} 175
             A4.25 4.25 0 0 0 96.25 179.25
             L175.375 179.25
             A11.5 11.5 0 0 1 175.375 202.25
             L80.5 202.25
             A11.5 11.5 0 0 1 {x0} 190.75
             Z"/>
    <rect x="100.625" y="53.75" width="86.25" height="23" rx="11.5"/>
    <rect x="100.625" y="116.5" width="86.25" height="23" rx="11.5"/>
  </g>
</svg>
'''


def main():
    os.makedirs(ASSETS, exist_ok=True)
    cache = {s: draw_mark(s) for s in sorted(set(ICO_SIZES + PNG_SIZES + [MAC_TILE]))}

    for s in PNG_SIZES:
        cache[s].save(os.path.join(ASSETS, f"icon-{s}.png"))
    for v in VARIANTS:
        draw_mark(512, v).save(os.path.join(ASSETS, f"icon-{v}-512.png"))

    def on_mac_grid(tile):
        canvas = Image.new("RGBA", (MAC_CANVAS, MAC_CANVAS), (0, 0, 0, 0))
        off = (MAC_CANVAS - MAC_TILE) // 2
        canvas.paste(tile, (off, off))
        return canvas

    on_mac_grid(cache[MAC_TILE]).save(os.path.join(HERE, "icon.png"))
    # The Dock icon the app sets at run time, drawn like the bundle's.
    for v in VARIANTS:
        on_mac_grid(draw_mark(MAC_TILE, v)).save(os.path.join(ASSETS, f"icon-{v}-mac.png"))

    for target in (os.path.join(HERE, "icon.ico"), os.path.join(ASSETS, "favicon.ico")):
        cache[256].save(
            target,
            format="ICO",
            sizes=[(s, s) for s in ICO_SIZES],
            append_images=[cache[s] for s in ICO_SIZES if s != 256],
        )
    # Phones and tablets: the iOS home-screen icon and Android's maskable one.
    draw_square(180).save(os.path.join(ASSETS, "apple-touch-icon.png"))
    draw_square(512).save(os.path.join(ASSETS, "icon-maskable-512.png"))

    appx = os.path.join(HERE, "appx")
    os.makedirs(appx, exist_ok=True)
    for name, (w, h, ms) in APPX_TILES.items():
        tile = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        tile.paste(draw_mark(ms), ((w - ms) // 2, (h - ms) // 2))
        tile.save(os.path.join(appx, name + ".png"))

    for v in VARIANTS:
        with open(os.path.join(HERE, f"icon-{v}.svg"), "w", encoding="utf-8", newline="\n") as fh:
            fh.write(svg(v))
    for target in (os.path.join(HERE, "icon.svg"), os.path.join(ASSETS, "icon.svg")):
        with open(target, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(svg(DEFAULT))
    print("wrote build/icon.ico, build/icon.png, 3 SVGs, %d tiles in build/appx/ and %d assets in src/assets/"
          % (len(APPX_TILES), len(PNG_SIZES) + 4 + 2 * len(VARIANTS)))


if __name__ == "__main__":
    main()
