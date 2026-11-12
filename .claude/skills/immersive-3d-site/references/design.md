# Design

The 3D gets attention. The design is what makes it look expensive rather than like a tech demo. Read this
before writing markup.

## Type

- **Two families at most:** one display, one text. Or one family in two weights. Load from Google Fonts with
  `display=swap`.
- **Display type big and tight:** headlines between `clamp(2.2rem, 6.5vw, 5.4rem)` and
  `clamp(3.4rem, 13vw, 11rem)` for the hero, line-height 0.9 to 1, letter-spacing slightly negative.
- **Body type calm:** 16 to 18px, line-height 1.5 to 1.6, measure under 34rem, softer ink colour.
- **Few words per act.** A 3D act carries one idea. Two short lines of headline and at most two sentences.
  If it needs a paragraph, it is a different kind of section.
- Emphasis comes from size and weight. No gradient text, no glow, no outline type.

## Layout

- **Vary where the copy sits.** Left, right, bottom, top, split, centre. Never the same anchor three acts in a row.
- The scene and the copy share the screen; decide which half belongs to which before placing either. On a
  phone they stack: scene above, copy below, or copy at the bottom over a dark part of the scene.
- Generous gutters (`--gutter`), nothing touching the edge.
- One fixed nav, small: logo and the one action. No mega menu on a page like this.

## Colour

- A dark or a light ground, one accent, neutrals. The accent marks the action and a few highlights in the
  scene, nothing else.
- Use the same palette inside the 3D: accent instances, accent emissive rings, materials tinted toward the
  brand. A scene in different colours from the page looks pasted in.
- Read colours from the CSS tokens in the script (`getComputedStyle`) so the page and the scene can never drift.

## Contrast

- Every line must read at every scroll position. Check the sheets, not your intention.
- Fix with `.scrim` (a soft radial shadow behind the text block), by moving the scene away from the copy, or by
  darkening the scene where copy sits. Never a full-screen overlay: it kills the 3D you paid for.

## Motion

- **Scroll moves things; time barely does.** Idle motion is slow (a full turn takes 30 seconds or more) and
  small. The big changes belong to scroll so the visitor feels in control.
- Ease everything: `ease.inOut` for travel, `ease.out` for arrivals. Linear motion looks mechanical.
- Split acts into beats with `seg()`: something happens, a pause, the next thing. Continuous change with no
  rests is tiring.
- Animate `transform` and `opacity` only in CSS. Never `transition: all`.
- Reduced motion: the copy is all there immediately, the scene shows a good still state, nothing travels.

## Tells that make it look machine-made

- A spinning torus knot or a wobbly sphere as the whole idea
- Every section a heading and paragraph centred over the same scene
- "Scroll to explore", a bouncing chevron, a mouse icon
- 01 / 05 counters, an eyebrow label over every heading
- Stock-style copy: "Experience the future of ...", "Unleash", "Elevate"
- Neon glow on everything, bloom so strong the scene turns to fog
- A footer that just appears after the last act instead of a close that lands
