#!/usr/bin/env bash
# Regenerates every app icon from the master artwork. Requires ImageMagick 7
# built with librsvg (`magick -list format | grep SVG` should say RSVG, not
# MSVG — the internal renderer makes a mess of curves).
#
#   bash assets/brand/generate-icons.sh
#
# Nothing in packages/frontend/public/ should be edited by hand — this is the
# only thing that writes those files.
set -euo pipefail
cd "$(dirname "$0")"

SRC=krusant-logo.svg
OUT=../../packages/frontend/public
BG='#0e1116'   # must match background_color in public/manifest.json
# Rendered well above the target size, then downsampled — cheap, and it keeps
# the curve edges clean at 16px where they matter most.
DENSITY=600
# Lossless: drop metadata and squeeze. These all land in the service worker's
# precache, so every install pays for whatever they weigh.
PNGOPT=(-strip -define png:compression-level=9 -define png:compression-filter=5)

command -v magick >/dev/null || { echo "ImageMagick 7 (magick) not found" >&2; exit 1; }

# The master's viewBox is already square and cropped to the mark, so there is
# no trimming or padding to do here — it renders full-bleed as-is.

# --- transparent, full-bleed -------------------------------------------------
# No baked-in background: a browser tab is not always dark, and the mark should
# sit on whatever is behind it.
magick -background none -density $DENSITY "$SRC" -resize 512x512 "${PNGOPT[@]}" "$OUT/icon-512.png"
magick -background none -density $DENSITY "$SRC" -resize 192x192 "${PNGOPT[@]}" "$OUT/icon-192.png"
magick -background none -density $DENSITY "$SRC" -define icon:auto-resize=48,32,16 "$OUT/favicon.ico"
cp "$SRC" "$OUT/favicon.svg"

# --- opaque, and deliberately so ---------------------------------------------
# iOS composites a transparent home-screen icon onto black anyway, so bake the
# brand background in rather than leaving the result to the platform.
magick -background none -density $DENSITY "$SRC" -resize 180x180 \
  -background "$BG" -alpha remove -alpha off "${PNGOPT[@]}" "$OUT/apple-touch-icon.png"

# Maskable icons get cropped to a circle of 80% diameter, so this one keeps its
# inset on purpose — full-bleed here would shave the ring off.
magick -background none -density $DENSITY "$SRC" -resize 400x400 \
  -background "$BG" -gravity center -extent 512x512 -alpha remove -alpha off \
  "${PNGOPT[@]}" "$OUT/icon-maskable-512.png"

echo "wrote:"
ls -1 "$OUT"/icon-*.png "$OUT"/apple-touch-icon.png "$OUT"/favicon.ico "$OUT"/favicon.svg
