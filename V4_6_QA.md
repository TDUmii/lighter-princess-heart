# Heart v4.6 — Mini-hearts fly home on the inward beat

## User-requested behavior

The v4.5 animation moved the entire particle volume inward, but its emitted small heart glyphs disappeared after the outward burst. There was no identifiable **flight back toward the heart**. This version adds that missing animation.

## How the new motion works

- Outbound: near phase 0.30 of the 0.90-second heartbeat, 3D surface particles fly away as miniature heart glyphs, then dim.
- Return: near phase 0.82 of the preceding beat (staggered per particle) the same mini-hearts become visible **outside** the rounded body.
- Inbound path: return particles travel along their own 3D surface normals, from 7.2 model units outside toward 1.6 units **inside** the shell.
- Contraction: hearts continue flying inward through the phase wrap (phase 1 → 0), and fade into the volume by about phase 0.15–0.18, during the visible heartbeat contraction.
- The 3D path is continuous across phase 1 → 0. Every returning glyph has a smooth ease-in/ease-out trajectory and a sine-based visibility envelope. Per-particle delay gives a natural stagger without random teleporting.
- The previous outward envelope was shortened slightly so the return does not interfere with the late outbound glow.
- Color and size on the return are slightly warmer/brighter, distinguishing homebound miniature hearts from the base particles.

## Technical implementation

- `src/v4/heartbeat.js`: `returnProgress()`, `returnStrength()` and `returnDistance()` with one shared phase-wrap rule.
- `src/v4/config.js`: `returnTravel: 7.2`, `returnInset: 1.6`.
- `src/v4/shaders.js`: new uniform-driven 3D return branch for the burst layer. The same existing particle buffer is reused, so the extra phase does not increase particle counts.
- `src/v4/renderer.js`: uploads the inward travel and inset uniforms.
- `src/v4/fallback.js`: identical inbound/outbound decision and normal-based movement in Canvas2D.

## Visual and automated QA

- 34/34 automated tests pass, including 4 new tests verifying return timing, distance, wrap continuity, and GPU/Canvas consistency.
- Browser rendered seven frozen frames at desktop 1200×720: outbound .48, outer return .875, middle return .965, boundary-crossing .035, arrival .125, contraction .15 and expansion .32.
- Using the same bright-pink threshold for each frozen frame, the visible region enclosing the heart and outside returning particles shrank from approximately 806 px wide at phase .875 to 744 px at .965, 665 px at .035 and 532 px at .125.
- Rendering WebGL2 `glError = 0` throughout all seven frozen phases; no browser console errors.
- Mobile test 390×844: WebGL2 works without errors; no automatic rotation; the centered front-view button remains present.
- The secret `love you` still appears only when zooming in, and disappears again when reset to 100%.
- Canvas2D fallback still initializes and renders when WebGL2 is disabled.
- Frame captures live in local `QA_TEMP` and are excluded from the Git release.

## Limits

This is a procedural animation reconstructed for the website, not the original film effect. The 0.9-second beat, physics and color remain approximations. Browser-based mobile simulation does not guarantee performance on a physical phone.
