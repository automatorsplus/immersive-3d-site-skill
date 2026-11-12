# Immersive 3D Site Skill for Claude Code

> Part of the **Automators+** skills library -- Claude Code skills shared exclusively with the Automators+ community.

Describe a business and get a website that is a live 3D world. The camera moves as you scroll, things react
when you click them, and real text sits on top. It is not a video of 3D: every frame is drawn in the browser
with Three.js. No API keys, no image generation, no build step.

## What You Get

- **A plan before any code** -- the journey through the page, how each part should feel, and the one moment a visitor will remember
- **A different 3D idea in every section** -- glass and metal objects, particle clouds that form shapes and words, camera flights, exploded views, whole worlds. Never the same trick twice in a row
- **One thing to click that no other site has** -- a signature move written for your page
- **Real places built from research** -- for a gym, a hotel or a shop it looks up how the real thing is laid out and builds it in real sizes
- **A plain static site at the end** -- one `index.html` and a small engine beside it. Host it anywhere
- **It checks its own work** -- screenshots at every scroll position on desktop, on phone and with reduced motion, and it looks at them before telling you it is done
- **A log of what it has built** -- so your second site does not look like your first

## Prerequisites

- **Claude Code**
- **Node.js 18 or newer** -- runs the local preview server and the screenshot check
- **Google Chrome** -- the screenshot check drives it
- **playwright-core** -- Claude installs it in the build folder the first time (`npm i playwright-core`)

Nothing to sign up for and nothing to pay for beyond Claude itself.

## Install the Skill

```
git clone https://github.com/automatorsplus/immersive-3d-site-skill
```

Copy the `.claude/skills/immersive-3d-site/` folder into your project's `.claude/skills/` folder, then restart
Claude Code. The whole folder is needed, not just `SKILL.md`: the engine, the references and the scripts sit
beside it.

## Try It

Say one of these in Claude Code:

- /immersive-3d-site Build a 3D landing page for an indoor climbing gym. The camera climbs the wall as you scroll, and every hold lights up when you tap it.
- /immersive-3d-site A private island hotel as one continuous 3D world. Let me drag the sun from sunrise to night.
- /immersive-3d-site Rebuild the landing page in this folder as an immersive 3D site. Keep the copy and the prices.
- /immersive-3d-site A product page for a pair of headphones that come apart into their pieces as I scroll.

You get better pages when you give it three things: references that are not websites (a film, a game, a
poster), the one moment you want people to remember, and one thing a visitor can click. If you leave those
out it will ask.

Then look at what it made and give it notes. The second and third rounds are where it gets good.

## How It Works

The skill definition is in [`.claude/skills/immersive-3d-site/SKILL.md`](.claude/skills/immersive-3d-site/SKILL.md).
`engine/` is the small scroll engine every page uses. `references/` holds the scene devices, the page
structures, the design rules, the feel check and the performance limits. `scripts/serve.mjs` previews a
build and `scripts/shoot.mjs` takes the screenshots. `templates/starter/` is a working example page to
borrow patterns from.

## License

MIT

---

*Shared with the Automators+ community*
