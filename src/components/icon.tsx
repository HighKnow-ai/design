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
