# Heart v4.5 — Visible contraction, miniature-heart burst, stationary camera

## Goals

Address feedback from the live v4.4 website:
1. The inward beat was nearly invisible; particles must visibly pull toward the center before expanding.
2. Too few small heart-shaped particles were visible, especially when the beat sends particles outward.
3. Disable all automatic camera rotation, including post-drag momentum, and expose a clearly labeled **Chính diện** button centered at the bottom.

## Animation changes

- The principal contraction envelope changed from `-0.058` to `-0.132` at phase 0.15 of a 0.90-second cycle.
- The expansion peak changed slightly from `+0.091` to `+0.103` at phase 0.32.
- The core contraction multiplier is now `1.12 - 0.15 * r²` rather than `1.08 - 0.40 * r²`, and the shell uses weight `0.91` rather than `0.46`.
- The same pulse factor scales X/Y/Z, keeping the rounded 3D heart intact while contracting and expanding.
- Added a subtle recoil phase at 0.515, followed by a small rebound at 0.685.
- The outer burst envelope lasts 0.42 cycles rather than 0.38 and the travel length increased from 3.05 to 3.40 units.

## Miniature hearts

- Randomly selected core particles rendered as heart glyphs increased from about 0.65% to about 5.4%.
- All emitted burst particles use the tiny-heart glyph even at default zoom, instead of round glowing dots.
- Visible burst system: 1,300 to **2,000 desktop** and 550 to **850 mobile** particles.
- Total particle budget: 18,200 desktop and 7,600 mobile.
- Retains the glow/color design of v4.4 and does not add a separate hard border.

## Camera and UI

- Removed the automatic spin mode and the orbit-toggle button.
- Removed post-drag camera inertia: a dragged heart stays at its chosen angle.
- Added a centered bottom **⟲ Chính diện** shortcut for returning to yaw 0°, pitch 0° and centered pan, without resetting zoom.
- Retained the existing +/−/100% zoom controls in their separate bottom-right group.
- On mobile, the front-view control is centered slightly higher to avoid overlapping the zoom group.
- The secret message still appears only at deep zoom.

## QA

- `npm test`: 30/30 tests pass, including regression tests for stronger contraction, uniform 3D scaling, more heart-shaped sprites, removal of auto-spin and centered front button.
- `npm run check`: JavaScript syntax valid.
- Desktop 1200 × 720: WebGL2 glError = 0, 18,200 particles, button center x = 600.
- Fixed-phase desktop screenshot analysis using the same bright-pink threshold:
  - Rest: highlighted width ~520 px.
  - Compression (phase 0.15): ~452 px.
  - Expansion (phase 0.32): ~572 px.
  - Burst (phase 0.56): approximately 8.46% highlighted-pixel coverage, compared with 7.60% at rest.
- Mobile 390 × 844: WebGL2 glError = 0, no collision between centered front button and zoom controls.
- Zoom 100%: secret hidden. Zoom 450%: secret visible. Reset 100%: secret hidden.
- Canvas2D fallback works with WebGL2 intentionally disabled.
- Browser console errors: zero.
- Film/reference images and QA screenshots are excluded from Git; no personal data is committed.

## Limits

Measurements are from browser simulation and show animation differences in the reconstructed effect, not proof of 100% fidelity to frames from the television production. Real phone frame rate remains unverified.
