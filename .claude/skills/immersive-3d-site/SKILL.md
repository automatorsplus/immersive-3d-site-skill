---
name: immersive-3d-site
description: >
  Build an immersive, real-time 3D website: live Three.js scenes behind real HTML, driven by scroll and
  pointer. Glass and metal hero objects with bloom, particle clouds that morph into shapes and words, camera
  flights along a path, exploded product views, shader backgrounds, instanced worlds. Plans the journey and
  the one moment people remember first, then builds a static site with no build step and no API keys, then
  screenshots every scroll position on desktop and phone to prove it holds up. Use for "3D website",
  "immersive website", "crazy 3D site", "three.js landing page", "WebGL site", "scroll 3D", "make the site 3D",
  "interactive 3D hero", "a website that feels like a game", or any request for a site that should feel like
  an experience rather than a document.
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, AskUserQuestion
---

# immersive-3d-site

A page where the 3D is live, not a video of 3D. The visitor's scroll is the timeline and their cursor is a
second camera. Real text sits on top, readable and selectable; the WebGL canvas sits behind it.

**What you hand back:** a build folder with `BRIEF.md`, one real `index.html`, the engine files beside it,
and a strip of screenshots from desktop, phone and reduced motion, plus a short report of what you checked
and what you could not.

## What makes these pages fail

Most "3D websites" are one trick held for the whole page: a spinning model with text fading over it. By the
third section the visitor has seen everything and stops scrolling. Four rules stop that:

1. **Every act does something different.** Use at least four different scene devices from
   [references/scene-kit.md](references/scene-kit.md), never the same one twice in a row.
2. **One peak.** One act is the moment someone describes to a friend. It gets the most scroll room, the best
   scene, and a quieter act before it so it lands.
3. **The 3D serves the message.** Every scene shows something true about the subject: what it is made of,
   how it works, what it feels like. A scene that is only decoration gets cut.
4. **Text stays readable at every scroll position.** If a line is hard to read over the scene at any frame,
   the scene moves, not the text.

## Step 0: The brief

Reuse whatever the user already gave you. If they gave a full brief or said "use your judgment", write
`BRIEF.md` yourself, mark it `Written under creative delegation`, answer every question below yourself in the
brand's voice, and go. Otherwise ask all eight in one message, as real questions, never a menu you made up:

1. **What is it, who is it for, and what should they do at the end?** One action, one label used everywhere.
2. **The feel in three to five words**, plus up to three references from anything but websites: a film, a
   game, an album cover, a shop. Naming websites is how a page ends up copying one.
3. **The journey in their words:** what the visitor hits first, next, last.
4. **Where it should be calm and where it should be intense.**
5. **How someone should feel at each stage, and the one moment they should remember.** See
   [references/feel.md](references/feel.md).
6. **One thing this site should do that no site they have seen does.** The seed of the signature move. Push
   for a real answer; "be memorable" is not one.
7. **How far from premium-minimal:** offer the range in
   [references/structures.md](references/structures.md#aesthetic-range).
8. **One continuous world, or separate scenes?** The biggest structural fork, and their call. Plus: what they
   already have (logo, colours, fonts, product photos, 3D models as `.glb`).

Write `BRIEF.md` in the build folder with their answers in their words, then add:

- **The journey:** four to seven beats, each a change in what the visitor knows or feels.
- **The feeling curve:** one line per beat, the feeling and what on screen causes it. No two neighbours alike.
- **The peak:** the sentence a visitor would say about it, and which act it lives in.
- **It's the site where ___:** filled with an experience, not a technique.
- **The signature move:** one interaction that exists on this site only, coded in the page. A kit device with
  new numbers does not count.
- **Any deliberate silence,** marked, so the checks can tell it from dead scroll.

## Step 1: Structure, log, then score

Three things, in this order. All three before any code.

**Pick a structure** from [references/structures.md](references/structures.md): one world, chapters, product
stage, exhibition, playground, editorial with inserts, broadcast. The nav, the opening and the close follow
from it. Write in `BRIEF.md` why this one and not the others.

**Run the fingerprint log.** Read `FINGERPRINTS.md` in the folder that holds your builds (create it if
missing; it starts empty). The plan must differ from every existing row on at least four of: structure, nav,
hero device, act sequence, close, signature move. If it fails, change the plan, not the log.

**Score it.** Feeling curve first, then a device per beat, as a table in `BRIEF.md`:

| Beat | Act | Feeling | Device | Span | Why this device |
|---|---|---|---|---|---|
| Recognition | hero | curiosity | glass object + dolly | 2 | The product, alive, before a word is read |
| Turn | morph | anticipation | particle morph | 3 | Noise becomes a shape becomes the name |
| Peak | rail | awe | camera rail | 3.5 | Travelling through it says there is a lot in here |
| Proof | explode | trust | exploded view | 2.5 | Shows the parts, which is the claim |
| Commitment | close | calm | calm hold | 1.5 | The page stops and waits for the click |

Checks before building:
- The structure's bans hold.
- Four or more device families from [references/scene-kit.md](references/scene-kit.md), none twice in a row.
- No two neighbouring acts share a feeling.
- The peak has the largest span by a clear margin, and the act before it is calmer.
- The close resolves and holds instead of fading into a footer.
- Spans are in screen heights. A cinematic page lands around 8 to 14; editorial and playground pages can be
  shorter. Never pad to hit a number.

## Step 2: Build

```bash
mkdir -p <build> && cp <skill>/engine/stage.js <skill>/engine/stage.css <build>/
```

Start from `templates/starter/index.html` for the structure (import map, canvas, sections, one module
script), and borrow the act patterns you scored. **Never ship the starter or its Orbis copy.** Every page is
written from its own brief.

How the engine works (`engine/stage.js`, read the header comment):

- The page is a stack of `<section data-act="name" data-span="2">`. Each holds a `.frame` that sticks for
  the length of the section.
- `stage.act(name, { scene, camera, update(p, s), render(renderer, s), resize(w, h) })` registers a scene.
  `p` runs 0 to 1 across the act. `s` carries `time`, `dt`, `pointer` (smoothed, -1 to 1), `velocity`
  (scroll speed), `width`, `height`, `reduced`, `coarse`.
- Whichever act holds the middle of the screen renders. Acts that share one `scene` object all update
  together, so a single continuous world is just several acts pointing at the same scene.
- **An act needs a span above 1 for `p` to move.** `p` is measured over the distance the frame stays stuck, so a
  span of exactly 1 has none: `p` snaps from 0 to 1 and anything tied to it never shows. Use 1.25 or more.
- Every section gets `--p` as a CSS variable, so headings can move on the same timeline as the 3D.
- `data-reveal` on any element fades it in on entry; stagger with `style="--i:2"`.
- Use `seg(p, a, b)` to split one act into beats and `ease.inOut` and friends to shape them.
- No WebGL: `html.no-webgl` shows each act's `.poster`. Give every act a poster (an image or a gradient).

Theme with the tokens at the top of `stage.css` (canvas, surface, ink, ink-soft, accent, accent-ink, two
fonts). Never edit the engine for one project; bespoke behaviour goes in the page's own script.

Three.js comes from a pinned CDN version in the import map (`three@0.186.1` on jsdelivr). Keep the pin. If
you need a newer version, pick one at least two weeks old and re-run the checks.

Read [references/design.md](references/design.md) before writing markup and
[references/performance.md](references/performance.md) before adding the second scene.

## Step 3: Prove it

```bash
cd <build> && npm i playwright-core          # once per build folder; needs Google Chrome installed
node <skill>/scripts/serve.mjs --root . --port 4600 &
node <skill>/scripts/shoot.mjs --url http://localhost:4600 --out shots/desktop
node <skill>/scripts/shoot.mjs --url http://localhost:4600 --out shots/phone --width 390 --height 844 --touch
node <skill>/scripts/shoot.mjs --url http://localhost:4600 --out shots/reduced --reduced-motion --positions 0,1
```

The script scrolls every act to five positions, waits for the smoothing to settle, screenshots each, and
writes `sheet.png`. It fails on: page errors, failed requests, no WebGL, an act that draws nothing, and
sideways scroll. A pass means it runs, not that it is good.

**Then open every `sheet.png` and look.** For each act at each position: can every line be read? Does the
scene show what the beat says? On the phone, is anything cropped, covered or tiny? Does the peak look like
the peak? Does the close resolve? Fix, shoot again, look again.

**Then the feel check** ([references/feel.md](references/feel.md#6-the-feel-check)): scroll it cold, one word
per act for what you felt, then compare with the curve in `BRIEF.md`. Where they disagree, fix the page.

Say plainly what was not covered: headless Chrome draws WebGL in software, so the frame rate it reports is
not a real device's, and it cannot tell you how scrolling feels on a real phone. Ask the user to open it on
their phone before calling it finished.

## Hard rules

| Never | Instead |
|---|---|
| One scene device for the whole page | Four or more families, none twice in a row |
| Text baked into a texture or image | Real HTML on top of the canvas |
| A scroll arrow, mouse icon or "scroll to explore" | Nothing. The hero is enough |
| Section counters like 01 / 05 | Delete them |
| Centred copy in every act | Vary it: left, right, centre, split, top, bottom |
| A full-screen dark overlay for contrast | `.scrim` behind the text block only |
| Gradient text, neon glow on type | Weight and size do the emphasis |
| Invented numbers or stats | Only real figures from the user |
| Em dashes in visible copy | Full stop, comma, colon |
| Spinning things that never stop | Motion follows scroll or pointer; idle motion is slow and small |
| A fresh WebGL renderer per section | One canvas, one renderer, many scenes (the engine does this) |
| Shipping the starter page | Write the page from its own brief |
| Building before the structure, log and score exist | Step 1, all three |
| Two peaks, or none | One, with the most room and a quiet act before it |
| A plan that matches an earlier build on three or more log columns | Change the plan, never the log |
| Calling it done without Step 3 | Run Step 3, look at the sheets, do the feel check |

## Output

The build folder, then a short report: the structure and why, the fingerprint result against each row, the
journey, the feeling curve and the peak, the score table, the signature move, what `shoot.mjs` reported on
all three runs, what you saw on the sheets and fixed, the feel check (intended against felt), and what you
could not check. Give the local URL. Then add the build's row to `FINGERPRINTS.md`.
