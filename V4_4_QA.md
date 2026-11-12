# Heart v4.4 — rounded reference heart

## Reference and goal

The goal is a live, orbitable particle heart matching the *rounded, luminous pink heart* reference selected in chat. This is not an image substitute: all particles use a procedural 3D field and remain animated.

## Shape changes

- Replaced the three-ellipsoid smooth union (which distorted the two lobes) with a **single continuous 3D heart polynomial**.
- The front now has two rounded lobes, a central cleft and a balanced tapered lower tip.
- Depth has its own smooth elliptical section; the side view remains rounded at the top and bottom, not sliced flat.
- Sampling on surface and through the interior uses the same heart field and its 3D surface normals.
- Default orbit starts close to front-facing, so the first view resembles the reference before the user turns the object.
- Rescaled to occupy more of the viewport while fitting both desktop and mobile screens.

## Particle appearance

- Reduced the core opacity for a darker, deeper center.
- Kept a dense curved 3D shell with a stronger **view-dependent bright pink-white rim**.
- Added a small, deterministic subset of visible miniature heart sprites even at normal zoom; all points become mini-heart sprites at deep zoom.
- Halo brightness is concentrated near the silhouette without turning the whole heart into a white mass.
- Corrected heartbeat depth scaling: core and shell expand smoothly along all three axes, rather than exaggerated Z swelling.

## Interaction preserved

- Mouse and touch orbit rotation.
- Periodic heartbeat and outward 3D bursts from the surface.
- Zoom and camera reset.
- `love you` hidden at 100%, revealed only after deep zoom, always oriented toward the viewer when visible.
- No instructional caption in the corner.

## QA evidence

- `npm test`: 26/26 passing, including 5 new reference-shape/material regression tests.
- `npm run check`: passed.
- Four fixed camera views rendered (front, 45°, side, 180°); WebGL2 error 0 in each.
- Mobile simulated viewport 390 x 844: WebGL2 error 0, ~60 FPS using requestAnimationFrame sampling; this is **not** measured on a physical phone.
- Hidden message at 100%, visible at 450%, stays hidden after reset; no corner hint.
- Canvas2D compatibility mode tested by intentionally disabling WebGL2; it renders and the secret stays hidden at normal zoom.
- No browser console errors.
- Captures and generated reference images are retained only in local QA storage and are not shipped as assets.

## Limitations

The generated reference is a stylized still, not a real 3D model or video with lighting data; exact pixel-for-pixel matching at all rotation angles is not possible to verify from that single image. The implementation aims for the same proportions, rounded profile and luminous particle look while remaining interactive.
