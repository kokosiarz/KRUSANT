# Brand assets

The app mark, and everything the app ships is generated from it.

| file | what it is |
| --- | --- |
| `krusant-logo-1024.png` | raster master, 1024×1024, gold mark on transparency with a soft glow |
| `krusant-logo.svg` | vector version, traced from the master and shipped as `favicon.svg` |
| `generate-icons.sh` | regenerates every icon in `packages/frontend/public/` |

**This folder is not part of any build.** It deliberately does not live in
`packages/frontend/public/` — files there are copied into the build *and* swept
into the service worker's precache by the `globPatterns` in `vite.config.ts`, so
parking a 1.2 MB master there would make every install download it for nothing.

## Regenerating the icons

Requires ImageMagick 7. From the repo root:

```bash
bash assets/brand/generate-icons.sh
```

Nothing in `packages/frontend/public/` should be edited by hand; that script is
the only thing that writes those files. Three decisions in it are deliberate and
will look like bugs if you don't know why:

- **The master is cropped to the mark before anything else.** It carries ~120px
  of soft glow on every side. Left in, that becomes dead margin and the mark
  reads small in a launcher. The crop measures the *solid* mark by thresholding
  alpha, so the glow doesn't count towards the bounds.
- **The favicon and PWA icons are transparent; `apple-touch-icon` and the
  maskable one are not.** iOS composites a transparent home-screen icon onto
  black regardless, so that one bakes the brand background in rather than
  leaving the result to the platform. Maskable icons are cropped by the launcher
  to a circle of 80% diameter, which is also why that one keeps an inset while
  everything else is full-bleed — full-bleed there would shave the ring off.
- **The square padding is centred, not stretched.** The mark is 782×757, so
  making it fill a square exactly would distort the ring visibly.

## Replacing the mark

Drop the new artwork in as `krusant-logo-1024.png`, re-run the script, and check
the 16px favicon is still legible — fine detail turns to mush at that size and
it's the one output nobody thinks to look at:

```bash
magick packages/frontend/public/favicon.ico[2] -scale 128x128 /tmp/preview.png
```

To redo `krusant-logo.svg`, trace the alpha channel rather than the colour —
the mark is one flat gold, so its silhouette is all a tracer needs:

```bash
# black mark on white, with a margin so no shape touches the edge (a shape
# running off the boundary traces as a stray sub-pixel sliver)
BOX=$(magick krusant-logo-1024.png -alpha extract -threshold 50% -format "%@" info:)
magick krusant-logo-1024.png -alpha extract -threshold 50% -crop "$BOX" +repage \
  -negate -bordercolor white -border 2 mask.png
potrace --svg mask.png -o traced.svg   # or Inkscape: Path > Trace Bitmap
```

Then set the path's `fill` to `#D0AA6E` with `fill-rule="evenodd"` (the ring
interior and the gaps between segments are holes, not separate shapes) and give
it a square `viewBox` centred on the mark. The committed SVG matches the raster
master to within about one pixel everywhere.
