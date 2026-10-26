# @highknow/design

HighKnow's design system: the base tokens, the fonts and the React components every HighKnow
surface is built from. Tailwind CSS 4 and React 19. MIT.

## Use

```css
/* the surface's own stylesheet */
@import "tailwindcss";
@import "@highknow/design/theme.css"; /* tokens and utilities; paints nothing */
@import "@highknow/design/base.css"; /* the floor, focus ring, reduced motion: an app only */
@import "@highknow/design/fonts.css"; /* Public Sans (roman and italic) and JetBrains Mono */

/* then the product's own roles */
@theme inline {
  --color-attention: var(--attention);
}
```

```tsx
import { Button, ReadError, Delayed } from "@highknow/design";
import { SiteHeader, Hero } from "@highknow/design/marketing"; // marketing pages only
```

No `@source` is needed for the package: `theme.css` declares its own, so Tailwind scans the
compiled components wherever the package is installed.

**Dark** is the `.dark` class on `<html>`, set before first paint from `prefers-color-scheme`. A
surface that must never go dark never sets it. **A surface that floats over other windows** imports
`theme.css` and `fonts.css` but never `base.css`, whose `body` floor would paint its window.

## What is here

| Entry | Holds |
|---|---|
| `theme.css` | The colour roles (light and dark), the type scale with `lead` (20 px), `leading-prose`, the fluid `text-display-1` to `-3`, three shadows and the scrim, the curve and its durations |
| `base.css` | The base layer, the disclosure motion and the reduced-motion rules |
| `fonts.css` | The three Fontsource faces |
| `tokens.json` | The tokens, for a consumer that is not Tailwind |
| `.` | 38 shadcn/ui primitives, the composites (`ReadError`, `Delayed`, `EmptyState`, `ConfirmDestructive`, `Tip`, `RelativeTime`, `Toaster` and `notify`, `createIconSet`, `Wordmark`, `LanguageSwitcher`) and the app frame (`SidebarFrame`, `NavGroup`, `NavItem`, `TopBar`, `PageBody`) |
| `./marketing` | `SiteHeader`, `SiteFooter`, `Section`, `Hero`, `HeroIndex`, `FeatureGrid`, `CallToAction` |
| `./components/*` | One primitive by file, as shadcn names it |

## Rules the package keeps

- **No product copy.** Every visible word is a prop. The only defaults are English accessible
  names, which a localised surface replaces. A test parses every component and fails on a word
  written into one.
- **Neutral tones only.** Button and Badge carry the base's tones. A product adds its own:

  ```tsx
  export const Button = createButton({
    attention: "bg-attention text-attention-foreground hover:bg-attention/90",
  });
  ```

- **A state maps to a tone in exactly one place, and that place is the product's.** A product
  with states (an agent running, waiting, stopped) writes one table from each state to a tone, an
  icon and a word, and renders every state through it. No screen picks a `<Badge variant>` for a
  state itself. Flywheel's `StateBadge` is the example:

  ```tsx
  const STATE = {
    running: { tone: "running", icon: "LoaderCircle", word: "Running" },
    waiting: { tone: "attention", icon: "Hand", word: "Waiting on you" },
    stopped: { tone: "destructive", icon: "OctagonX", word: "Stopped" },
  } as const satisfies Record<State, { tone: Tone; icon: IconName; word: string }>;
  ```

- **One component, one surface's worth of meaning.** A component moves into the package when a
  second surface needs it. A product's domain components (claim rows, the board's story key) stay
  in the product.

## Develop

`pnpm build` compiles `src/` to `dist/` with `tsc`; `pnpm test` builds, then runs the tests,
including the one that proves a consumer gets the classes through `@source`. The CSS ships as
source. `tokens.json` is generated from `theme.css` by its test: after changing a token, run
`pnpm exec vitest run -u` and commit both.

Components were generated with the shadcn CLI (`components.json`, style `radix-nova`) and are
edited in place; run it with `pnpm dlx shadcn@4.22.1 add <name>`.

Releases and the version policy are in `CHANGELOG.md`.
