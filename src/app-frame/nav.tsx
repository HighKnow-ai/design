import type { MouseEvent, ReactNode } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../components/ui/sidebar.js";
import { cn } from "../lib/utils.js";

const ROW =
  "h-9 gap-2.5 rounded-md px-2.5 text-body text-sidebar-foreground [&_svg]:size-[18px] " +
  "focus-visible:ring-0 focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-ring group-data-[collapsible=icon]:size-9! " +
  "group-data-[collapsible=icon]:p-[9px]!";

const CURRENT =
  "bg-sidebar-primary font-semibold text-sidebar-primary-foreground shadow-card ring-1 " +
  "ring-sidebar-border hover:bg-sidebar-primary";

export interface NavGroupProps {
  readonly label?: string | undefined;
  readonly className?: string | undefined;
  readonly children: ReactNode;
}

export function NavGroup({ label, className, children }: NavGroupProps) {
  return (
    <SidebarGroup className={cn("px-2 py-1.5", className)}>
      {label !== undefined ? (
        <SidebarGroupLabel className="h-7 px-2.5 text-meta text-muted-foreground type-condensed">
          {label}
        </SidebarGroupLabel>
      ) : null}
      <SidebarMenu className="gap-0.5">{children}</SidebarMenu>
    </SidebarGroup>
  );
}

export interface NavLinkProps {
  readonly href: string;
  readonly className?: string | undefined;
  readonly "aria-current"?: "page" | undefined;
  readonly onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  readonly children: ReactNode;
}

export interface NavItemProps {
  readonly href: string;
  readonly label: string;
  readonly icon?: ReactNode;
  readonly active?: boolean | undefined;
  readonly badge?: number | null | undefined;
  readonly badgeAnnouncement?: string | undefined;
  readonly onSelect?: (() => void) | undefined;
  readonly renderLink?: ((props: NavLinkProps) => ReactNode) | undefined;
}

export function NavItem({
  href,
  label,
  icon,
  active = false,
  badge,
  badgeAnnouncement,
  onSelect,
  renderLink,
}: NavItemProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const shown = typeof badge === "number" && badge > 0 ? badge : null;

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (onSelect !== undefined) {
      event.preventDefault();
      onSelect();
    }
    if (isMobile) setOpenMobile(false);
  };

  const content = (
    <>
      {icon}
      <span>{label}</span>
      {/* THE SPACE IS A SIBLING TEXT NODE, NOT THE SPAN'S FIRST CHARACTER. A name computation that
          trims each child's text before joining inline children (dom-accessibility-api, which
          Testing Library uses, once jsdom 30 reports a span as `inline`) loses a leading space
          inside the span and reads "Review queue(3 new)". A whitespace-only node between flex
          items is not drawn, so nothing moves on screen. */}
      {shown !== null ? (
        <>
          {" "}
          <span className="sr-only">{badgeAnnouncement ?? `(${shown})`}</span>
        </>
      ) : null}
    </>
  );
  const current = active ? ("page" as const) : undefined;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={label} className={cn(ROW, active && CURRENT)}>
        {renderLink !== undefined ? (
          renderLink({ href, "aria-current": current, onClick, children: content })
        ) : (
          <a href={href} aria-current={current} onClick={onClick}>
            {content}
          </a>
        )}
      </SidebarMenuButton>
      {shown !== null ? (
        <SidebarMenuBadge
          aria-hidden="true"
          className="top-2! right-1.5 h-5 min-w-5 rounded-md bg-secondary px-1.5 text-meta text-secondary-foreground tabular-nums ring-1 ring-sidebar-border"
        >
          {shown}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}
