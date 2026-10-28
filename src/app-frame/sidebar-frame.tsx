/**
 * The sidebar frame: the sidebar app's chrome as parts, composed from Tenure's
 * `packages/ui/src/knowledge/AppShell.tsx` with every product fact taken out. The product passes its
 * brand, its rows and its foot; the frame owns the geometry (248 px open, 56 px folded to icons,
 * a Sheet on a phone), the remembered fold, and the floor the page sits on.
 *
 *   <SidebarFrame brand={…} nav={<NavGroup label="Knowledge"><NavItem … /></NavGroup>} footer={…}>
 *     <TopBar leading={<SidebarTrigger label={…} />} title="Meetings" action={…} />
 *     <PageBody>…</PageBody>
 *   </SidebarFrame>
 *
 * NO WORD OF THE PRODUCT'S. The accessible names below have English defaults, which a localised
 * surface replaces; everything visible is passed in.
 */
import type { CSSProperties, ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "../components/ui/sidebar.js";
import { cn } from "../lib/utils.js";

export interface SidebarFrameProps {
  /** The sidebar's head: the mark and the product's name. */
  readonly brand?: ReactNode;
  /** The rows: `NavGroup`s of `NavItem`s. */
  readonly nav: ReactNode;
  /** The sidebar's foot: account, language, legal links. Hidden while folded to icons. */
  readonly footer?: ReactNode;
  /** Where the viewer's fold is remembered (`localStorage`). Absent, it is not remembered. */
  readonly storageKey?: string | undefined;
  readonly defaultOpen?: boolean | undefined;
  /** The navigation landmark's accessible name. */
  readonly navLabel?: string | undefined;
  /** The fold handle's accessible name. */
  readonly toggleLabel?: string | undefined;
  /** The phone Sheet's accessible name and description. */
  readonly mobileTitle?: string | undefined;
  readonly mobileDescription?: string | undefined;
  readonly className?: string | undefined;
  /** The page: a `TopBar` and a `PageBody`. */
  readonly children: ReactNode;
}

export function SidebarFrame({
  brand,
  nav,
  footer,
  storageKey,
  defaultOpen = true,
  navLabel = "Primary",
  toggleLabel = "Toggle Sidebar",
  mobileTitle = "Navigation",
  mobileDescription = "Every page, grouped.",
  className,
  children,
}: SidebarFrameProps) {
  return (
    <SidebarProvider
      {...(storageKey === undefined ? {} : { storageKey })}
      defaultOpen={defaultOpen}
      className={cn("min-h-dvh bg-background text-foreground", className)}
      style={{ "--sidebar-width": "248px", "--sidebar-width-icon": "56px" } as CSSProperties}
    >
      <Sidebar
        collapsible="icon"
        className="border-sidebar-border"
        mobileTitle={mobileTitle}
        mobileDescription={mobileDescription}
      >
        <nav aria-label={navLabel} className="flex min-h-0 flex-1 flex-col">
          {brand !== undefined ? (
            <SidebarHeader className="flex-row items-center px-4 pt-4 pb-2 transition-[padding] group-data-[collapsible=icon]:px-3.5">
              {brand}
            </SidebarHeader>
          ) : null}
          <SidebarContent className="gap-0">{nav}</SidebarContent>
          {footer !== undefined ? (
            <SidebarFooter className="gap-3 px-4 pb-4 group-data-[collapsible=icon]:hidden">
              {footer}
            </SidebarFooter>
          ) : null}
        </nav>
        <SidebarRail label={toggleLabel} />
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">{children}</SidebarInset>
    </SidebarProvider>
  );
}
