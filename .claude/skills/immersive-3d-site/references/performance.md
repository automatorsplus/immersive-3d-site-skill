# Performance

A 3D page that stutters feels broken, however good it looks in a screenshot. Budget before you build.

## Budgets, per act

| | Desktop | Phone |
|---|---|---|
| Draw calls | under 50 | under 25 |
| Triangles | under 500k | under 150k |
| Particles | 12k to 20k | 6k to 8k |
| Instances | under 20k | under 5k |
| Bloom | fine | one or two acts only |
| Transmission (glass) | fine | one object on screen |

`window.__stage.state.stats` shows calls, triangles and points for the last frame; `shoot.mjs` records them per
screenshot in `report.json`.

## Rules the engine already follows

- One canvas, one renderer, for the whole page. Scenes swap; the GL context never does.
- Pixel ratio capped at 2 on desktop and 1.5 on touch devices. Antialias off on touch.
- Rendering stops when the tab is hidden.
- Scroll and pointer are smoothed once, centrally.

## Rules for your act code

- **Build everything once.** Geometry, materials and textures are created at load, never inside `update()`.
  Reuse vectors and matrices (allocate them outside the update function).
- **Instance anything that repeats.** Ten copies of a mesh means `InstancedMesh`, not ten meshes.
- **Read `s.coarse`** to cut counts on touch devices, and `s.reduced` to stop idle motion.
- **Merge static geometry** with `BufferGeometryUtils.mergeGeometries` when many static pieces share a material.
- **Textures:** 2048px at most, power of two, compressed where possible. Prefer procedural over downloaded.
- **Models:** `.glb` with Draco or meshopt compression, under 5MB. Load with a progress state, and keep the
  act's poster visible until it arrives.
- **Shaders:** keep noise octaves to three or four; full-screen shaders cost per pixel, so they are the first
  thing to simplify on phones (render at half resolution if needed).

## Mobile composition

- Tall screens see less width. `aspectZ()` in the starter pulls the camera back on portrait screens; apply it
  to every act or the subject crops.
- Move the subject up and the copy down on phones rather than overlapping them.
- Never rely on hover. The pointer barely moves on touch.
- Test the phone run every time, not at the end.
- The offset that lifts the subject on a phone can push the sun or the horizon out of frame. Set it per act, not once
  for the whole page.

## Fallbacks

- No WebGL: `html.no-webgl` hides the canvas and shows `.poster` in each act. Every act needs one.
- Reduced motion: `html.reduced-motion` and `s.reduced`. Show a strong still state per act; the scroll still
  changes the scene, but without smoothing or idle animation.
