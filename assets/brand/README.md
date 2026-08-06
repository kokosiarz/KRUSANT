# Brand assets

The app mark, and everything the app ships is generated from it.

| file | what it is |
| --- | --- |
| `krusant-logo.svg` | **the master.** Square viewBox, cropped to the mark: a dark disc, then one flat gold path |
| `generate-icons.sh` | regenerates every icon in `packages/frontend/public/` |

The disc behind the mark is what makes the icon read as round — background inside
the ring, transparent outside it. Its radius isn't arbitrary: the ring is a
slight ellipse (outer radius 377.5 vertically, 391.5 horizontally, centred at
`392.5, 380` in viewBox units) with a band at least 80 units thick, so `r="372"`
is the largest circle that still sits *inside* the gold the whole way round. Much
larger and a dark fringe shows outside the ring at the top and bottom; much
smaller and a transparent gap opens between the disc and the ring's inner edge.
Re-measure before changing it — those numbers came from sampling the rendered
silhouette by angle, not from the artwork's source.

The master used to be a 1024px PNG. The SVG replaced it once it was confirmed to
match within about a pixel, and the raster was dropped — it's still in git
history (`git log -- assets/brand/krusant-logo-1024.png`) if the original soft
glow is ever wanted, which the traced silhouette does not carry.

**This folder is not part of any build.** It deliberately does not live in
`packages/frontend/public/` — files there are copied into the build *and* swept
into the service worker's precache by the `globPatterns` in `vite.config.ts`.

## Regenerating the icons

Requires ImageMagick 7 **built with librsvg** — check with
`magick -list format | grep SVG` and look for `RSVG`. The internal `MSVG`
fallback renders curves badly, and it fails quietly, so the icons would simply
come out subtly wrong. From the repo root:

```bash
bash assets/brand/generate-icons.sh
```

Nothing in `packages/frontend/public/` should be edited by hand; that script is
the only thing that writes those files. Three decisions in it are deliberate and
will look like bugs if you don't know why:

- **The favicon and PWA icons are transparent; `apple-touch-icon` and the
  maskable one are not.** iOS composites a transparent home-screen icon onto
  black regardless, so that one bakes the brand background in rather than
  leaving the result to the platform. Maskable icons are cropped by the launcher
  to a circle of 80% diameter, which is also why that one keeps an inset while
  everything else is full-bleed — full-bleed there would shave the ring off.
- **Everything renders at density 600 and is then downsampled.** Rendering
  straight to 16px gives a muddier result than rendering large and shrinking.
- **The PNGs are stripped and max-compressed.** They all land in the service
  worker's precache, so every install pays for whatever they weigh.

## Replacing the mark

Drop the new artwork in as `krusant-logo.svg` — square `viewBox`, no margin
around the mark, since the icons are rendered full-bleed from it — then re-run
the script. Check the 16px favicon is still legible afterwards; fine detail turns
to mush at that size and it's the one output nobody thinks to look at:

```bash
magick packages/frontend/public/favicon.ico[2] -scale 128x128 /tmp/preview.png
```

### If you only have a raster

Trace the alpha channel rather than the colour — the mark is one flat gold, so
its silhouette is all a tracer needs:

```bash
# black mark on white, cropped to the mark, with a margin so no shape touches
# the edge (a shape running off the boundary traces as a stray sub-pixel sliver)
BOX=$(magick logo.png -alpha extract -threshold 50% -format "%@" info:)
magick logo.png -alpha extract -threshold 50% -crop "$BOX" +repage \
  -negate -bordercolor white -border 2 mask.png
potrace --svg mask.png -o traced.svg   # or Inkscape: Path > Trace Bitmap
```

Then set the path's `fill` to `#D0AA6E` with `fill-rule="evenodd"` (the ring
interior and the gaps between segments are holes, not separate shapes) and give
it a square `viewBox` centred on the mark.
