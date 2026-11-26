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
  readonly brand?: ReactNode;
  readonly nav: ReactNode;
  readonly footer?: ReactNode;
  readonly storageKey?: string | undefined;
  readonly defaultOpen?: boolean | undefined;
  readonly navLabel?: string | undefined;
  readonly toggleLabel?: string | undefined;
  readonly mobileTitle?: string | undefined;
  readonly mobileDescription?: string | undefined;
  readonly className?: string | undefined;
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
