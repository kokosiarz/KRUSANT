# Brand assets

`krusant-logo-1024.png` is the master artwork for the app mark: 1024×1024, gold
emblem on transparency. Everything the app actually ships is generated from it.

**This folder is not part of any build.** It deliberately does not live in
`packages/frontend/public/` — files there are copied into the build *and* swept
into the service worker's precache by the `globPatterns` in `vite.config.ts`, so
parking a 1.2 MB master there would make every install download it for nothing.

## Regenerating the icons

Requires ImageMagick 7 (`magick`). Run from this directory:

```bash
SRC=krusant-logo-1024.png
OUT=../../packages/frontend/public
BG='#0e1116'   # must match background_color in public/manifest.json

# "any" icons — the mark composited onto the app background, matching the
# opaque icons these replaced. A transparent icon reads as a floating smudge
# on a light launcher background.
magick "$SRC" -background "$BG" -alpha remove -alpha off -resize 512x512 "$OUT/icon-512.png"
magick "$SRC" -background "$BG" -alpha remove -alpha off -resize 192x192 "$OUT/icon-192.png"
magick "$SRC" -background "$BG" -alpha remove -alpha off -resize 180x180 "$OUT/apple-touch-icon.png"

# Maskable — launchers crop to a circle of 80% diameter, so the artwork is
# inset and the background bleeds to the edges.
magick "$SRC" -resize 470x470 -background "$BG" -gravity center -extent 512x512 \
  -alpha remove -alpha off "$OUT/icon-maskable-512.png"

# Favicon: one .ico carrying 16/32/48.
magick "$SRC" -background "$BG" -alpha remove -alpha off \
  -define icon:auto-resize=48,32,16 "$OUT/favicon.ico"
```

There is no SVG favicon. The mark is artwork rather than a glyph, so it does not
survive being hand-traced into a handful of paths the way the old "k" did — the
`.ico` covers the small sizes and `icon-192.png` everything above them. Both are
declared in `packages/frontend/index.html`; the PWA sizes are listed in
`packages/frontend/public/manifest.json`.

## Replacing the mark

Drop the new master in as `krusant-logo-1024.png`, re-run the block above, and
check the 16px result is still legible (`magick favicon.ico[2] -scale 64x64
preview.png`) — fine detail turns to mush at that size and it is the one output
nobody thinks to look at.
