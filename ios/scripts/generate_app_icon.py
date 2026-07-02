#!/usr/bin/env python3
"""Generate the Planter App Store icon (1024x1024, RGB, no alpha).

A layered marigold rosette — the flower shared by Punjabi weddings and
Día de los Muertos — over a deep moss field, framed by a thin
phulkari/talavera-style diamond band.

Usage: python3 generate_app_icon.py
Requires: Pillow (pip install pillow)
"""
import math
import os

from PIL import Image, ImageDraw

SIZE = 1024
SS = 4  # supersample factor for smooth edges
S = SIZE * SS

MOSS = (53, 94, 59)
MOSS_DEEP = (40, 72, 45)
FERN = (74, 124, 89)
MARIGOLD = (232, 155, 46)
SAFFRON = (212, 102, 31)
SUN = (232, 184, 74)
TERRA = (200, 114, 77)
PAPER = (251, 246, 233)


def petal_ring(draw, cx, cy, count, r_inner, r_outer, width_deg, color, rotate_deg=0.0):
    """Draw a ring of rounded petals as filled polygons."""
    for i in range(count):
        angle = math.radians(rotate_deg + i * 360.0 / count)
        half = math.radians(width_deg / 2.0)
        tip_x = cx + r_outer * math.cos(angle)
        tip_y = cy + r_outer * math.sin(angle)
        base_l = (cx + r_inner * math.cos(angle - half), cy + r_inner * math.sin(angle - half))
        base_r = (cx + r_inner * math.cos(angle + half), cy + r_inner * math.sin(angle + half))
        mid_r = (r_inner + r_outer) / 2.0
        bulge = math.radians(width_deg * 0.72)
        side_l = (cx + mid_r * math.cos(angle - bulge), cy + mid_r * math.sin(angle - bulge))
        side_r = (cx + mid_r * math.cos(angle + bulge), cy + mid_r * math.sin(angle + bulge))
        draw.polygon([base_l, side_l, (tip_x, tip_y), side_r, base_r], fill=color)


def diamond_band(draw, y_center, x_start, x_end, step, size, color):
    """A horizontal band of small diamonds (phulkari / talavera geometry)."""
    x = x_start
    while x <= x_end:
        draw.polygon(
            [(x, y_center - size), (x + size, y_center), (x, y_center + size), (x - size, y_center)],
            fill=color,
        )
        x += step


def main():
    img = Image.new("RGB", (S, S), MOSS)
    draw = ImageDraw.Draw(img)

    # Subtle radial deepening toward the corners
    grad_steps = 48
    max_r = S * 0.78
    for i in range(grad_steps, 0, -1):
        t = i / grad_steps
        r = max_r * t
        c = tuple(int(MOSS_DEEP[j] + (MOSS[j] - MOSS_DEEP[j]) * (1 - t)) for j in range(3))
        draw.ellipse([S / 2 - r, S / 2 - r, S / 2 + r, S / 2 + r], fill=c)

    cx = cy = S / 2

    # Marigold rosette: layered petal rings, outer to inner
    petal_ring(draw, cx, cy, 16, S * 0.10, S * 0.360, 20, SAFFRON, rotate_deg=0)
    petal_ring(draw, cx, cy, 16, S * 0.09, S * 0.315, 20, MARIGOLD, rotate_deg=11.25)
    petal_ring(draw, cx, cy, 12, S * 0.07, S * 0.255, 26, SAFFRON, rotate_deg=0)
    petal_ring(draw, cx, cy, 12, S * 0.06, S * 0.210, 26, MARIGOLD, rotate_deg=15)
    petal_ring(draw, cx, cy, 10, S * 0.04, S * 0.150, 30, SUN, rotate_deg=0)

    # Center disc
    r_core = S * 0.062
    draw.ellipse([cx - r_core, cy - r_core, cx + r_core, cy + r_core], fill=SAFFRON)
    r_dot = S * 0.036
    draw.ellipse([cx - r_dot, cy - r_dot, cx + r_dot, cy + r_dot], fill=SUN)

    # Phulkari diamond bands top and bottom
    band_y_top = S * 0.075
    band_y_bottom = S - band_y_top
    d = S * 0.016
    step = d * 3.2
    diamond_band(draw, band_y_top, step, S - step, step, d, TERRA)
    diamond_band(draw, band_y_bottom, step, S - step, step, d, TERRA)
    small = d * 0.45
    diamond_band(draw, band_y_top, step * 1.5, S - step, step, small, PAPER)
    diamond_band(draw, band_y_bottom, step * 1.5, S - step, step, small, PAPER)

    icon = img.resize((SIZE, SIZE), Image.LANCZOS)

    out_dir = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "..", "Planter", "Resources", "Assets.xcassets", "AppIcon.appiconset",
    )
    out_path = os.path.normpath(os.path.join(out_dir, "AppIcon-1024.png"))
    icon.save(out_path, "PNG")

    check = Image.open(out_path)
    assert check.size == (1024, 1024), check.size
    assert check.mode == "RGB", check.mode
    print(f"wrote {out_path} ({check.size[0]}x{check.size[1]}, {check.mode})")


if __name__ == "__main__":
    main()
