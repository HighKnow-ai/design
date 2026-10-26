/**
 * A sidebar's rows (#616 point 3), from Tenure's `AppShell` `NavRow`, with its product facts (the
 * icon table keyed on Tenure's page ids, the review-queue badge) taken out: the product passes the
 * icon, the badge and its announcement.
 *
 * THE CURRENT ROW IS A RAISED CARD ON THE SIDEBAR GROUND, NEVER THE BRAND (Flywheel's rule): the
 * brand is for the one primary action, and a sidebar where the current page is blue spends it.
 */
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
  /** The condensed uppercase group name. Absent, the group has no heading. */
  readonly label?: string | undefined;
  readonly className?: string | undefined;
  readonly children: ReactNode;
}

/** A named group of rows: Knowledge, Workspace, Governance. */
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

/** What `renderLink` receives: everything a router's link needs to look and behave like a row. */
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
  /** A Lucide glyph, drawn at 18 px. */
  readonly icon?: ReactNode;
  readonly active?: boolean | undefined;
  /** A count beside the row. Only a number above zero shows; `null` is not known. */
  readonly badge?: number | null | undefined;
  /** What a screen reader hears after the label while the badge shows: "(3 new)". */
  readonly badgeAnnouncement?: string | undefined;
  /**
   * Called on a press INSTEAD of following `href`: a surface with no router (a desktop window)
   * would otherwise navigate its webview.
   */
  readonly onSelect?: (() => void) | undefined;
  /** How the row is rendered as a link: a router passes its own `Link` here. */
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
    // On a phone the Sheet closes once a page is chosen; the page is what the reader asked for.
    if (isMobile) setOpenMobile(false);
  };

  const content = (
    <>
      {icon}
      <span>{label}</span>
      {shown !== null ? (
        <span className="sr-only"> {badgeAnnouncement ?? `(${shown})`}</span>
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
