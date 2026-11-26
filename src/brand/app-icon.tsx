import { MarkGlyph } from "./mark-glyph.js";
import { BRAND_HEX as BRAND } from "./wordmark.js";

export type AppIconTile = "rounded" | "square" | "macos";

export interface AppIconProps {
  readonly tile: AppIconTile;
  readonly glyphScale?: number | undefined;
}

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
