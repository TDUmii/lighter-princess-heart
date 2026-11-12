# Heart v4.3: continuous implicit 3D volume

## Problem addressed

The v4.2 shape used an existing 2D heart contour and a per-row front/back thickness. From the side it produced an almost flat top, visible joining band and an uneven, cut-looking profile.

## Geometry replacement

- `heartField(x,y,z)` is a continuous negative-inside/positive-outside signed field.
- Two rounded top lobes are combined with a tapered lower ellipsoid using smooth unions.
- The surface is sampled radially in 3D by bisection; normals are gradients of the actual 3D field.
- The core is sampled uniformly inside the full 3D volume, not with x/y points extruded into Z.
- 100% of shell and burst particles now follow the genuine 3D surface rather than tracing a 2D planar rim.
- Both the front and back, the top and the sides remain curved when orbiting.
- The lower body tapers in X for a heart-like frontal tip, but stays rounded along Z from a side view.

## Appearance

- Desktop: 8,400 core + 7,800 curved-surface shell + 1,300 burst = **17,500 particles**.
- Mobile: 3,650 + 3,100 + 550 = **7,300 particles**.
- Shell rendering uses view-dependent Fresnel brightness: stronger rim glow at grazing angles and a more spacious, less saturated center.
- Existing motion period, burst timing, orbit controls and zoom-only `love you` remain unchanged.

## Visual QA

Source photograph: `D:\Code\_film_heart_reference.jpg`. Local renders are stored in `QA_TEMP`; these copyrighted film assets are **not** added to the public repository.

Measured in 1200 × 637 screenshots, a fixed pink-pixel threshold `R>80 && R>1.28G && R>1.03B && R>max(G,B)+10` gives:

| Measure | Film still | Local v4.3 front |
|---|---:|---:|
| Pink region fraction | 9.39% | 8.07% |
| Pink median RGB | 150, 70, 94 | 137, 63, 92 |
| Bright region width | 415 px | 431 px |
| Bright region height | 403 px | 402 px |

The measurements are **not frame-accurate reproduction proof**: the film frame has camera perspective, lighting and post-processing.

Four orbital angles were rendered: 0°, 45°, 90°, 180°. The side profile is a rounded dome, with no planar horizontal top or 2D rim joining stripe. The image was visually inspected alongside the film still.

## QA results

- 21/21 geometry, particle, motion and orbit tests passed.
- 900 random surface samples are all near the implicit isosurface and have unit outward normals.
- WebGL2 shader compilation and rendering on desktop and mobile returned `glError = 0`.
- Mobile viewport 390 × 844: zoom 100% hides text, zoom 450% shows text; rotating preserves visibility, reset hides it.
- Canvas2D fallback successfully displayed without WebGL2.
- Browser automated 390 × 844 sample: about 60 FPS (not a measurement on a physical phone).
- Main 3D heart is procedurally rebuilt; no additional film media shipped.

## Antigravity availability

Antigravity GUI executable was detected on the Windows machine, but an autonomous task API/CLI was not confirmed; do not claim it independently reviewed the result. The geometry work, browser automation and visual verification here were performed through UmiBridge.

## Limits

This is an independently programmed recreation. The reference frame/video does not provide the original production rig or full animation/material parameters. It therefore cannot be certified as 100% identical to the film, despite the closer 3D shape.
