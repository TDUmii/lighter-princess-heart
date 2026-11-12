# Heart v4.7 — Balanced cinematic breathing

## Feedback addressed

In v4.6 the outward miniature-heart flight traveled about 3.4 model units while the inward flight started as far away as 7.2 units and then moved 1.6 units inside the shell. Incoming hearts were also larger and brighter than outgoing hearts. The viewer therefore saw an enormous return motion but a weak release.

## One physically continuous trajectory

The old two independently animated branches are replaced with **one trajectory for each existing burst particle**. The particle is not respawned between halves.

| Parameter | v4.6 | v4.7 |
| --- | ---: | ---: |
| Outward maximum | 3.4 units | 6.0 units |
| Return origin | 7.2 units outside | **6.0 units outside** |
| Return destination | 1.6 units inside | **0.0 (same surface origin)** |
| Outward leg duration | 0.355 beat fraction | 0.445 beat fraction |
| Inward leg duration | 0.360 beat fraction | **0.445 beat fraction** |
| Volume contraction envelope | -0.132 | **-0.115** |
| Volume expansion envelope | +0.103 | **+0.115** |
| Mini-heart size/brightness | inward emphasized | **equal both ways** |

Per-particle phase offset is ±0.0375 of a beat, using the existing deterministic buffer. An outward leg starts near phase 0.245 and peaks near phase 0.690. The same particle returns to the same starting shell point around the next phase 0.135, during contraction. The 0.9-second beat period remains unchanged.

Smoothstep distance easing gives zero velocity at launch, turning point and arrival. The opacity envelope fades particles in after takeoff, stays visible through the reversal and fades them out as they merge into the surface, preventing visual teleportation or a second spawn.

## Visibility and 3D volume

The 2,000 desktop / 850 mobile transient mini-hearts are reused. Roughly 70% are sampled with a bias toward high **transverse surface normals** (visible side/rim), but every particle remains on the curved 3D heart surface; front and back receive particles. This makes the outward motion visible from the front without adding a static hard outline.

## QA

- `npm test`: 38/38 passing, including new flight parity, turnaround smoothness, phase-seam continuity, silhouette visibility and equal GPU sizing tests.
- `npm run check`: passed.
- Seven desktop WebGL2 frames rendered at launch, half-outbound, outward peak, half-inbound, late inbound, maximal contraction and maximal expansion. Every frame returned `glError=0`.
- In the controlled browser model, the same representative particle has **3.0 units radial displacement** at both phase 0.4675 (mid-out) and phase 0.9125 (mid-in); peak is exactly **6.0 units**.
- Approximate 1200×720 bright-pink region widths in local screenshots: 535 px at mid-out, 538 px at mid-in, 461 px at maximum contraction, 581 px at maximum expansion. This is a visual sanity check, not exact film frame matching.
- Mobile simulated 390×844: WebGL2 `glError=0`, front-view button works, auto-spin absent; `love you` remains hidden at 100%, visible at 450%, hidden after reset.
- Canvas2D fallback also works when WebGL2 is disabled; no JavaScript console errors.
- QA screenshots are stored only locally in `QA_TEMP` and are not included in the public repository.

## Limitations

The effect is a film-inspired independent 3D particle reconstruction. Matching the original production animation perfectly would require the original effect source or enough synchronized reference footage; the parity and visual results here are verified for this implementation, not certified as 100% film fidelity.
