/**
 * A Lucide glyph by NAME, from Flywheel's `components/Icon.tsx`. Both products are
 * Lucide-only.
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * THE PRODUCT REGISTERS ITS NAMES; THE PACKAGE SHIPS NONE. A screen that knows its icon at
 * compile time imports it from `lucide-react` directly. This is for names that arrive as data
 * (Flywheel's state vocabulary), and which names those are is the product's business. Named
 * imports, never `import * as icons`: the namespace import pulls all of Lucide (about 1,600 icons)
 * into a bundle, which is why the registry is a map the product writes.
 *
 *   export const { Icon, isIconName } = createIconSet({ Inbox, CircleCheck, OctagonX });
 *
 * Every glyph is drawn at the 2px stroke, 16px by default, and is decorative (`aria-hidden`):
 * every icon sits next to its word. An unknown name draws nothing.
 */
import type { LucideIcon } from "lucide-react";

export interface IconProps<Name extends string = string> {
  readonly name: Name | (string & {});
  readonly size?: number | undefined;
  readonly className?: string | undefined;
}

export function createIconSet<const Icons extends Record<string, LucideIcon>>(icons: Icons) {
  type Name = Extract<keyof Icons, string>;

  function isIconName(name: string): name is Name {
    return Object.prototype.hasOwnProperty.call(icons, name);
  }

  function Icon({ name, size = 16, className }: IconProps<Name>) {
    if (!isIconName(name)) return null;
    const Glyph = icons[name] as LucideIcon;
    return <Glyph size={size} strokeWidth={2} aria-hidden="true" className={className} />;
  }

  return { Icon, isIconName, icons };
}
