# Page structures

The scene kit decides how each act looks. The structure decides how the whole page is put together: how
the visitor moves through it, what the nav does, how it opens and how it ends. Two sites with different
scenes but the same structure still feel like the same site. Pick the structure first, on purpose.

Seven structures are defined below. You can invent a new one, but only if its movement, order, ending and
bans are genuinely different. A new name on an old structure does not count.

---

## 1. One world

The whole page is one place, and scrolling moves you through it without a cut.

- **Moves by:** one shared `scene`, every act pointing at it, the camera travelling a single path.
- **Nav:** minimal, sits on top of the world; jumping ahead flies the camera there.
- **Opens:** inside the world already, mid-motion.
- **Ends:** the camera arrives somewhere and stops: the destination is the close.
- **Leans on:** camera rail, instanced crowd, hero object placed in the world.
- **Bans:** portals and hard swaps between scenes. If you need a cut, this is the wrong structure.
- **Fits:** places, journeys, processes (a gym, a factory, a trip).

## 2. Chapters

Distinct scenes, each its own act, with deliberate cuts between them.

- **Moves by:** a separate `scene` per act; the engine cross-fades the canvas at each swap.
- **Nav:** chapter names, current one marked.
- **Opens:** a strong single image, the first chapter's scene.
- **Ends:** a chapter of its own, the calmest one.
- **Leans on:** variety. Every chapter a different device family.
- **Bans:** two neighbouring chapters with the same device or the same text anchor.
- **Fits:** stories with clear stages, products with several distinct features.

## 3. Product stage

One object, centre stage, the whole page. Scroll changes its state: turns, opens, explodes, changes material,
gets used.

- **Moves by:** one hero object across several acts that share its scene; the background and lighting change
  around it.
- **Nav:** almost none. Logo and buy.
- **Opens:** the object, alone, beautifully lit.
- **Ends:** the object at rest with the price and the action beside it.
- **Leans on:** hero object, exploded view, calm hold, a material change as the peak.
- **Bans:** camera rails and big worlds. The object is the world.
- **Fits:** physical products, hardware, anything people want to look at closely.

## 4. Exhibition

A set of rooms. Each room holds one exhibit and the visitor walks from room to room.

- **Moves by:** acts that each frame one piece; a short travel between rooms.
- **Nav:** a room list or a map, so people can jump.
- **Opens:** the entrance: the name of the show and the first room visible behind it.
- **Ends:** an exit room with the action.
- **Leans on:** hero object per room, text in space, portal into the best room.
- **Bans:** long copy. Each room gets a title and a line.
- **Fits:** portfolios, collections, case studies, menus.

## 5. Playground

Interaction first. The page asks the visitor to touch something before it explains anything.

- **Moves by:** pointer and clicks drive the scenes as much as scroll does.
- **Nav:** hidden until the visitor has played.
- **Opens:** something to poke, with one short line telling them they can.
- **Ends:** the toy and the action together: keep playing or sign up.
- **Leans on:** physics moment, particle morph that follows the cursor, shader field that reacts.
- **Bans:** pinned sections that take control away for long stretches.
- **Fits:** games, creative tools, playful brands, anything aimed at a younger crowd.

## 6. Editorial with inserts

A readable article or long page, with 3D pieces dropped in where they explain something better than words.

- **Moves by:** normal scrolling text; 3D acts appear as full-bleed inserts between text blocks.
- **Nav:** a contents list or a reading progress line.
- **Opens:** a headline and a strong first insert.
- **Ends:** the conclusion and the action, set like the end of an article.
- **Leans on:** exploded view, shader field, text in space, used sparingly.
- **Bans:** 3D behind the body text. Inserts are separate from the reading column.
- **Fits:** explainers, launches with something to argue, reports.

## 7. Broadcast

Feels like live TV or a game HUD: overlays, data, energy, cuts on the beat.

- **Moves by:** fast acts, short spans, interface elements over the 3D.
- **Nav:** a persistent bar like a scoreboard or a level select.
- **Opens:** a title sequence, loud.
- **Ends:** a results screen.
- **Leans on:** instanced crowd, camera rail with quick moves, text in space, bold HUD type in HTML.
- **Bans:** calm holds longer than one screen; minimal premium styling.
- **Fits:** sport, events, competitions, gaming.

---

## The fingerprint log

Every finished build gets one row in `FINGERPRINTS.md`, kept in the folder that holds your builds (the parent
of the build folder). If the file does not exist, create it with the header below. It starts empty.

```
| Build | Date | Structure | Nav | Hero device | Act sequence | Close | Signature move |
|---|---|---|---|---|---|---|---|
```

- **Act sequence** is the device families in order, e.g. `object, particles, travel, assembly, stillness`.
- **Before building**, compare the plan against every existing row. The new build must differ from **each row**
  on at least **four of the six** columns after the date. If it does not, change the plan. Never change the log.
- **After shipping**, add the row.

This is what stops ten builds in a row coming out as the same page in different colours.

## Aesthetic range

Ask how far from premium-minimal the user wants to go, and let the answer set the look, not your taste:

- **Premium minimal:** dark or bone ground, one accent, huge type, lots of space
- **Editorial:** serif display, columns, rules and captions, magazine pacing
- **Playful:** saturated colour, rounded type, bouncy easing, toys
- **Brutalist:** raw grids, system or mono type, hard edges, no easing softness
- **Retro:** a period look committed to (80s chrome, 90s web, 70s print)
- **Maximalist:** layers, texture, many colours, dense composition
- **Technical:** mono type, grids, data, diagrams, HUD elements

Default to premium minimal only when the user has no view.
