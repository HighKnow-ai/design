# Changelog

Every release of `@highknow/design`, newest first. The version follows semver, and stays `0.x`
until the apex, Tenure and Flywheel all run on the package:

- **Major:** a token, component, prop or export removed or renamed, or a semantic role's meaning
  changed.
- **Minor:** something added, or a value changed without changing its meaning.
- **Patch:** fixes only.

In `0.x` a rename lands with the migration of every surface that runs the package from the
workspace. A release is the tag `design-vX.Y.Z` on the commit that carries its entry here.

## Unreleased

## 0.2.0 — 2026-10-29

From Tenure's page motion and re-tuned loading floor.

#### Components

- The loading hold is 350 ms, down from 400 (`LOADING_MIN_VISIBLE_MS`, so `Delayed`,
  `useDelayedLoading`, `useLoadingPhase` and `TopBar`'s `section`). The threshold stays 150 ms
  (`LOADING_THRESHOLD_MS`). 350 is the shortest hold that is not itself a flash: Tenure's opening
  check counts anything on screen under 300 ms as one, and the skeleton paints a frame or two after
  its timer fires. A value changed without changing its meaning: minor.
- `Delayed` marks content that replaced a skeleton with `data-handover="skeleton"`, a stable hook
  for a product to replace the base's fade on (Tenure's rows rise in turn instead). Added: minor.

#### Fixes

- Content that lands just before 150 ms is mounted once (`useDelayedLoading`, so `Delayed`,
  `useLoadingPhase` and `TopBar`'s `section`). The 150 ms timer was cleared in a passive effect,
  which runs a task after the commit that draws the content. On a loaded machine the timer fired in
  that gap, raised the skeleton over content already on screen and mounted the content a second
  time 350 ms later, which flashed it, replayed its entrance and dropped focus. The timer now
  clears in a layout effect, inside that commit. Fix: patch.

## 0.1.0

The first version: the base every HighKnow surface is built from.

Folded in before the first publish, from Tenure's migration and its opening screen:

#### Tokens

- `--duration-breath` (2080 ms, 8 × overlay): one cycle of a wait that repeats, for Tenure's opening
  mark. The base had no duration for a loop.
- `--font-ui` and `--font-code` name a fallback face right after their own: `Public Sans Fallback`
  and `JetBrains Mono Fallback` (`fonts.css`), local fonts scaled to the self-hosted faces' metrics
  (`size-adjust`, `ascent-override`, `descent-override`), so the swap when a file lands moves no
  text.

#### Components

- `TopBar`'s row is a button's height whether or not the page has an action, so a title no longer
  drops when an action arrives; its count is keyed by the title; and `section` follows the loading
  rule (nothing for 150 ms, then held at least 400 ms), as the title's skeleton.
- `Delayed` lays its skeleton out with the content's own wrapper (`display: contents` on the hidden
  layer), so a skeleton in a `flex flex-col gap-4` region has the content's gaps.

- `TopBar` takes `section`, shown in the title's place (never as the `h1`) while a page has no
  title yet, and its `h1` carries its full title as a tooltip for when it truncates. Both are
  Tenure's shell behaviours, kept when Tenure moved onto the frame parts.

### Tokens (`theme.css`, `tokens.json`)

- The base colour roles in light and dark, Flywheel's values with the pinned primary `#3c64dd`
  (`hsl(225, 70%, 55%)`) in both schemes and `#7d99ff` as its dark lift for `--running` and
  `--ring`, plus `--running-muted-foreground` for secondary text on the brand wash.
- The UI type scale, 12 · 13 · 14 · 15 · 17 · 20 · 24 · 26 · 34 · 52 px, each step with its
  leading. `lead` is the 20 px intro step; the 52 px step is `lead-count`.
- A prose leading of 1.65 (`leading-prose`), and a three-step fluid display ramp
  (`text-display-1` to `text-display-3`) that sets its own leading, tracking and weight.
- `--font-heading` as the UI face, and JetBrains Mono as the code face.
- Three shadows (card, overlay, showcase) and the scrim; one easing curve and its four durations.
- `tokens.json`: the same tokens, for a consumer that is not Tailwind.

### Base styles and fonts (`base.css`, `fonts.css`)

- The floor, the focus ring, selection and caret colours, scrollbars, the disclosure motion, and
  reduced motion that keeps meaning: movement goes, fades stay.
- Public Sans Variable, roman and italic, and JetBrains Mono, self-hosted through Fontsource.

### Components

- 38 primitives on shadcn/ui (radix-nova), with Skeleton stopping under reduced motion and Sidebar
  remembering its fold. Button and Badge ship neutral tones; `createButton` and `createBadge` add a
  product's own.
- Composites: `ReadError`, `Delayed` with `useDelayedLoading` and `useLoadingPhase`, `EmptyState`,
  `ConfirmDestructive`, `Tip`, `TruncateTip`, `RelativeTime`, the `Toaster` with `notify`,
  `createIconSet`, `Wordmark`, `MarkGlyph`, `AppIcon` and `LanguageSwitcher`.
- The app frame as parts: `SidebarFrame`, `NavGroup`, `NavItem`, `TopBar` and `PageBody`.
- `@highknow/design/marketing`: `SiteHeader`, `SiteFooter`, `FooterColumn`, `Section`, `Hero`,
  `HeroIndex`, `FeatureGrid` and `CallToAction`.
