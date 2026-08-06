#!/usr/bin/env bash
# Regenerates every app icon from the master artwork. Requires ImageMagick 7.
#
#   bash assets/brand/generate-icons.sh
#
# Nothing in packages/frontend/public/ should be edited by hand — this is the
# only thing that writes those files.
set -euo pipefail
cd "$(dirname "$0")"

SRC=krusant-logo-1024.png
SVG=krusant-logo.svg
OUT=../../packages/frontend/public
BG='#0e1116'   # must match background_color in public/manifest.json
# Lossless: drop metadata and squeeze. These all land in the service worker's
# precache, so every install pays for whatever they weigh.
PNGOPT=(-strip -define png:compression-level=9 -define png:compression-filter=5)

command -v magick >/dev/null || { echo "ImageMagick 7 (magick) not found" >&2; exit 1; }

# The master has ~120px of soft glow around the mark. Left in, it becomes dead
# margin in every icon and the mark reads small. Measure the *solid* mark
# (alpha thresholded, so the glow doesn't count) and crop to exactly that.
BOX=$(magick "$SRC" -alpha extract -threshold 50% -format "%@" info:)
BW=${BOX%%x*}; REST=${BOX#*x}; BH=${REST%%+*}
SIDE=$(( BW > BH ? BW : BH ))
echo "mark: ${BW}x${BH} -> square ${SIDE}"

MARK=$(mktemp -u).png
trap 'rm -f "$MARK"' EXIT
# Pad the shorter axis to square rather than stretching — the mark is slightly
# wider than tall and distorting it would be obvious on the ring.
magick "$SRC" -crop "$BOX" +repage -background none -gravity center \
  -extent "${SIDE}x${SIDE}" "$MARK"

# --- transparent, full-bleed -------------------------------------------------
# No baked-in background: a browser tab is not always dark, and the mark should
# sit on whatever is behind it.
magick "$MARK" -resize 512x512 "${PNGOPT[@]}" "$OUT/icon-512.png"
magick "$MARK" -resize 192x192 "${PNGOPT[@]}" "$OUT/icon-192.png"
magick "$MARK" -define icon:auto-resize=48,32,16 "$OUT/favicon.ico"
cp "$SVG" "$OUT/favicon.svg"

# --- opaque, and deliberately so ---------------------------------------------
# iOS composites a transparent home-screen icon onto black anyway, so bake the
# brand background in rather than leaving the result to the platform.
magick "$MARK" -background "$BG" -alpha remove -alpha off -resize 180x180 \
  "${PNGOPT[@]}" "$OUT/apple-touch-icon.png"

# Maskable icons get cropped to a circle of 80% diameter, so this one keeps its
# inset on purpose — full-bleed here would shave the ring off.
magick "$MARK" -resize 400x400 -background "$BG" -gravity center -extent 512x512 \
  -alpha remove -alpha off "${PNGOPT[@]}" "$OUT/icon-maskable-512.png"

echo "wrote:"
ls -1 "$OUT"/icon-*.png "$OUT"/apple-touch-icon.png "$OUT"/favicon.ico "$OUT"/favicon.svg
