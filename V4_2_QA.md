# Heart v4.2 - Rounded 3D volume and zoom-only message

## Fixes requested

1. A genuinely rounded, full 3D heart when rotating, not a flat shape extruded along the Z axis.
2. The message `love you` is **hidden at normal zoom** and shown only when zooming into the heart's middle, remaining readable while rotating.
3. Remove the small instructional caption in the corner.

## 3D volume construction

- `volumeThickness(x,y)` now uses actual intersections with the curved heart outline at each scanline, then builds smooth front/back depth.
- Thickness near the center: approximately 13 heart units; it decreases toward each lateral edge.
- Core particles span the interior volume and shell particles predominantly occupy the rounded front/back surfaces, including normal vectors.
- The shell is 84% volume surface and 16% outline rim, to avoid a bright vertical joining stripe when turned sideways.
- Burst particles are 72% rounded-surface particles and 28% rim particles, with their own 3D normals; bursts now move along Z as well as X/Y.
- The vertex shader and Canvas2D fallback slightly round the upper and lower body toward front/back poles for a softer profile from the side.
- GPU vertex layout now stores 13 float values for each particle, including normal Z.

## Text and UI

- Default zoom 100%: `love you` hidden.
- Zoom above about 240%: begin revealing the text at the heart's center.
- Deep zoom: text becomes visible and always faces the viewer, even after orbit rotation.
- Reset zoom 100% hides the message again.
- The corner instruction text has been removed from the DOM; rotation and zoom controls are preserved.

## QA

- `npm run check` passes.
- `npm test`: 16/16 tests pass, including rounded body thickness, front/back surface sampling, outward-facing 3D normals and message visibility conditions.
- Desktop viewport 1200 × 720: checked four directions (front, 45°, side, back), 17,500 particles, WebGL2 and no GL error.
- Mobile viewport 390 × 844: WebGL2 error 0; hidden at 100%, visible at 450%, remains visible after rotation, hidden after 100% reset.
- Canvas2D fallback: hidden at 100%, visible at 364%.
- No browser console errors in desktop/mobile checks.
- Comparison screenshots are local QA artifacts and are not committed.

## Limits

A sparkling, semi-transparent particle volume is not a closed mesh surface. At certain angles its silhouette will look like a rounded glowing body rather than the characteristic frontal heart. It is an independent reconstruction inspired by the film, not the original 3D asset or animation rig.
