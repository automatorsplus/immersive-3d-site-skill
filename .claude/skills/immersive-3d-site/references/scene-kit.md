# Scene kit

The devices an act can use. Each one says what it is for, how to build it, and what goes wrong. The starter
page (`templates/starter/index.html`) has a working version of the first five; copy from there.

Families matter more than names: a page needs four or more **families**, never the same family twice in a row.

---

## 1. Hero object (family: object)

A single sculpted object, centre of attention, lit by a studio environment. Glass, metal, stone, ceramic.

- **Build:** `MeshPhysicalMaterial`. Glass: `transmission: 1, thickness, ior: 1.45 to 1.5, roughness < 0.1`,
  optional `iridescence`, `attenuationColor` for a tint. Metal: `metalness: 1, roughness 0.2 to 0.4`.
- **Light it with no downloads:** `new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture`
  as `scene.environment`. Every physical material then has real reflections.
- **Give glass something to refract.** Transmission over an empty background looks grey. Put a glowing ring,
  shapes or particles behind it.
- **Displace by position, never by `Math.random()`.** `IcosahedronGeometry` is not indexed, so a random value per
  vertex moves each triangle's corners separately and the surface tears into shards.
- **Organic forms:** displace an `IcosahedronGeometry` on the CPU and recompute normals (`blob()` in the
  starter). For a recognisable object, build it from primitives (lathe, extrude, tube) or load the user's
  `.glb` with `GLTFLoader`.
- **Scroll:** dolly the camera in, turn the object, open or tilt a supporting element.
- **Goes wrong:** a ring or plane rotating fully edge-on reads as a glitchy band. Keep tilts under about 60°.

## 2. Particle morph (family: particles)

Thousands of points that travel from one shape to another: noise, a form, a word, a logo.

- **Build:** one `BufferGeometry` with a position attribute per shape (`position`, `aB`, `aC`) and a random
  `aSeed`. A small `ShaderMaterial` mixes between them with `uMix`, staggered per particle by the seed so they
  do not move as a block. Additive blending, round soft points.
- **Words and logos:** draw them on a 2D canvas, read pixels where alpha > 128, sample N of those as targets.
  Wait for the web font (`document.fonts.load`) before drawing.
- **Shapes:** sample vertices of any geometry (`TorusKnotGeometry`, a loaded model) or a parametric surface.
- **Scroll:** `uMix = seg(p, 0.1, 0.4) + seg(p, 0.5, 0.85)`; ease the rotation to zero as the word forms so it
  ends square to the camera.
- **Goes wrong:** points too small to see (`gl_PointSize` divides by distance; start around 30), the word wider
  than a phone screen (scale it with the aspect ratio), and forgetting `#include <colorspace_fragment>` so
  colours come out washed.
- Count: 12k to 20k on desktop, about 6k to 8k on touch devices.

## 3. Camera rail (family: travel)

The camera flies along a spline through a built world: rings, columns, a city, a body, a machine.

- **Build:** `CatmullRomCurve3` through 6 to 10 points. `camera.position = curve.getPointAt(t)`,
  `camera.lookAt(curve.getPointAt(t + 0.025))`. Bank slightly with `s.velocity` for a feeling of speed.
- **Populate with `InstancedMesh`**: hundreds of rings or blocks in one draw call. Colour individual instances
  with `setColorAt` (an accent every seventh ring gives rhythm). Fog (`FogExp2`) hides the end of the world.
- **Scroll:** `t = ease.inOut(p) * 0.9`, stopping short of the end so the camera never pokes out.
- **Goes wrong:** sharp corners in the curve cause whiplash, and pointer offsets large enough to clip through
  geometry. Keep pointer influence under half a unit.

## 4. Exploded view (family: assembly)

An object comes apart into its parts, or builds itself up from them. The best proof device there is.

- **Build:** a `Group` of part meshes, each with a rest position and an offset vector.
  `part.position = rest + offset * ease.inOut(seg(p, 0.1, 0.65))`. Turn the group slowly with `p` and tilt it
  with the pointer.
- **Labels:** real HTML list beside it, revealed in order with `data-reveal` and `--i`.
- **Goes wrong:** parts flying off screen at full spread (pull the camera back as they separate) and labels
  covered by parts on a phone (stack them: object above, text below).

## 5. Calm hold (family: stillness)

One object, barely moving, lots of space. Used before the peak to make it land, and for the close.

- **Build:** the hero object reused, slow idle rotation, a thin halo or ring, low bloom.
- **Goes wrong:** treating it as filler. It is a deliberate rest, so keep it short (1 to 1.5 screens).

## 6. Shader field (family: surface)

A full-screen plane with a fragment shader: flowing noise, liquid gradients, topographic lines, a grid that
warps under the cursor.

- **Build:** `PlaneGeometry(2, 2)` with a `ShaderMaterial` and an `OrthographicCamera(-1, 1, 1, -1, 0, 1)`.
  Uniforms `uTime`, `uP` (scroll), `uPointer`, `uRes`, brand colours. Simplex or value noise, a few octaves.
- **Use for:** an act about a feeling or a material, or as the ground behind DOM-heavy sections.
- **Goes wrong:** too much contrast behind text. Keep the field dark and low-contrast where copy sits.

## 7. Instanced crowd (family: mass)

Thousands of copies of one thing arranged by scroll: a field of products, a wall of tiles, a swarm that forms
a shape, a grid that ripples.

- **Build:** `InstancedMesh` with matrices updated per frame from a formula of index, time and `p`. Under 5k
  instances on phones.
- **Use for:** scale ("thousands of customers"), choice ("every colour"), or a transition between two forms.

## 8. Text in space (family: type)

Big 3D letters the camera moves around, or lines of type set on planes at different depths.

- **Build:** `TextGeometry` with a `FontLoader` font (typeface JSON), or HTML type with CSS 3D transforms
  driven by `--p` for the lighter version. Bevel lightly; give metal or glass material.
- **Goes wrong:** the headline only exists in 3D. Keep a real `<h2>` with the same words (visually hidden if
  needed) so it is still readable and searchable.

## 9. Portal (family: transition)

Fly into an object and come out somewhere else: through a lens, a doorway, a screen.

- **Build:** a second scene rendered to a `WebGLRenderTarget` and shown on a surface in the first. Scroll moves
  the camera into the surface; at the threshold, swap acts (the engine cross-fades the canvas).
- **Use for:** the peak. It is the most expensive device, so one per page at most.

## 10. Physics moment (family: play)

Objects that fall, stack, scatter or bounce when the visitor arrives or clicks.

- **Build:** simple hand-rolled physics for a few dozen bodies (gravity, floor, damping), or a library loaded
  from a pinned CDN version if collisions matter.
- **Use for:** the signature move. Something the visitor can poke.

---

## Building real things

When a scene shows a real kind of place or object (a gym, a kitchen, a bike), look up how the real thing is built
before modelling it: sizes, layout, materials, the small details people who use it would notice. Then:

- **Work in real units** (1 unit = 1 metre) and put a person in for scale. Things made at toy scale read as toys.
- **Draw surface detail in code:** a canvas texture for panel seams, bolt holes, grain or tile lines costs nothing and
  does more for realism than extra geometry.
- **Turn on shadows** for the hero scene (`renderer.shadowMap.enabled`, one directional light, a shadow box that follows
  the camera). Objects that cast no shadow look pasted on.
- **Add wear:** chalk marks, scuffs, a rope hanging slightly off straight. Perfect surfaces look computer-made.
- **Soft things need soft geometry.** A cushion, a mat or a sofa drawn as a flat box with a texture reads as a tile. Give
  each section a real bulge that tucks down into its seam, and darken the seam.
- **Set things the way a person would.** Objects placed by pure random scatter look scattered. Find the rule a real person
  follows (a route goes up in moves, books lean, cables hang from what is above them) and generate from that rule.
- **Fine grain goes in the colour map, not a bump map, on small instanced objects.** A bump map on them can produce a
  few broken pixels, and bloom turns one broken pixel into a white glare across the frame. If a glare appears from
  nowhere, hide one kind of object at a time until it goes.
- Write what you found, and where, in `BRIEF.md`.

## Post-processing

`EffectComposer` → `RenderPass` → `UnrealBloomPass` → `OutputPass`. Bloom strength 0.4 to 0.9, threshold
around 0.9 so only true highlights glow. Near-white materials under bright lights cross that line and turn into lamps: use a
dimmer white (about half) for chalk, rope or paper-coloured objects in a bloomed scene. Make it a per-act choice; acts with lots of text often look better
without it. The act's `render()` calls `composer.render()` and `resize()` calls `composer.setSize()`.

## Pointer

`s.pointer` is already smoothed. Use it for small camera offsets (0.2 to 0.5 units) or object tilt (0.1 to
0.3 radians). Larger feels seasick. On touch devices it stays near zero, so never hide content behind hover.
