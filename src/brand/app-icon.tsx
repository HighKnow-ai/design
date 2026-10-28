/**
 * The mark as an icon file: the favicon, the home-screen and web-app icons, and the desktop app's
 * icon, from Tenure's `packages/ui/src/brand/AppIcon.tsx`. A surface's own asset renderer
 * decides which variant each file gets; this component only knows how to draw them.
 *
 * ONE GLYPH AT EVERY SIZE: `MarkGlyph`, the logo's own paths — the bulb, its base, and the brain
 * whose halves read "HK". The first version shipped a hand-drawn bulb outline for 48 px and under, on the
 * grounds that the brain's strokes are under half a pixel wide at 16. The owner refused it on
 * sight ("this is not my logo"): the favicon is the logo, shrunk, not a drawing of a lightbulb.
 * Do not reintroduce a substitute glyph.
 *
 * THREE TILES, ONE PER PLATFORM'S CROP:
 *   `rounded`  the logo's own rounded square (`rx` 200), corners transparent: the favicon.
 *   `square`   the tile to the edges, opaque everywhere, for platforms that cut their own shape:
 *              iOS rounds an apple-touch-icon itself and fills transparency with black, and a
 *              maskable icon is cropped to anything from a circle to a square.
 *   `macos`    the macOS app-icon grid: an 824 px rounded square in a 1024 canvas with a
 *              transparent margin, so the Dock shows it at the size of every other app's icon
 *              rather than larger.
 *
 * No `role` or label: an icon file is never inline in a page, so there is no accessibility tree
 * for one to join — `Wordmark` is the in-page mark. `xmlns` is set because `favicon.svg` is this
 * component's static markup served as a standalone file, where a browser requires it.
 */
import { MarkGlyph } from "./mark-glyph.js";
import { BRAND_HEX as BRAND } from "./wordmark.js";

export type AppIconTile = "rounded" | "square" | "macos";

export interface AppIconProps {
  readonly tile: AppIconTile;
  /** The glyph's scale on the tile, the logo's 1.20 by default. */
  readonly glyphScale?: number | undefined;
}

/** The macOS icon grid's tile, in the 1024 canvas: 824 square, inset 100, corner radius 185. */
const MACOS = { inset: 100, size: 824, radius: 185 } as const;

export function AppIcon({ tile, glyphScale }: AppIconProps) {
  const drawn = <MarkGlyph scale={glyphScale} />;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
      {tile === "macos" ? (
        <>
          <rect
            fill={BRAND}
            x={MACOS.inset}
            y={MACOS.inset}
            width={MACOS.size}
            height={MACOS.size}
            rx={MACOS.radius}
            ry={MACOS.radius}
          />
          <g transform={`translate(512 512) scale(${MACOS.size / 1024}) translate(-512 -512)`}>
            {drawn}
          </g>
        </>
      ) : (
        <>
          <rect
            fill={BRAND}
            x="0"
            y="0"
            width="1024"
            height="1024"
            {...(tile === "rounded" ? { rx: "200", ry: "200" } : {})}
          />
          {drawn}
        </>
      )}
    </svg>
  );
}
