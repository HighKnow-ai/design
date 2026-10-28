/**
 * @highknow/design: the base every HighKnow surface is built from.
 *
 * The CSS is imported separately (`@highknow/design/theme.css`, `/base.css`, `/fonts.css`); this
 * entry is the React half. The marketing parts are a separate entry,
 * `@highknow/design/marketing`, which an app never imports.
 */
export { cn, TYPE_STEPS, type TypeStep } from "./lib/utils.js";

// ─── The primitives: Flywheel's 38 shadcn components, with Tenure's Skeleton and Sidebar ────
export * from "./components/ui/alert-dialog.js";
export * from "./components/ui/alert.js";
export * from "./components/ui/badge.js";
export * from "./components/ui/breadcrumb.js";
export * from "./components/ui/button-group.js";
export * from "./components/ui/button.js";
export * from "./components/ui/card.js";
export * from "./components/ui/checkbox.js";
export * from "./components/ui/collapsible.js";
export * from "./components/ui/command.js";
export * from "./components/ui/dialog.js";
export * from "./components/ui/dropdown-menu.js";
export * from "./components/ui/empty.js";
export * from "./components/ui/field.js";
export * from "./components/ui/hover-card.js";
export * from "./components/ui/input-group.js";
export * from "./components/ui/input.js";
export * from "./components/ui/item.js";
export * from "./components/ui/kbd.js";
export * from "./components/ui/label.js";
export * from "./components/ui/popover.js";
export * from "./components/ui/progress.js";
export * from "./components/ui/radio-group.js";
export * from "./components/ui/scroll-area.js";
export * from "./components/ui/select.js";
export * from "./components/ui/separator.js";
export * from "./components/ui/sheet.js";
export * from "./components/ui/sidebar.js";
export * from "./components/ui/skeleton.js";
export * from "./components/ui/sonner.js";
export * from "./components/ui/spinner.js";
export * from "./components/ui/switch.js";
export * from "./components/ui/table.js";
export * from "./components/ui/tabs.js";
export * from "./components/ui/textarea.js";
export * from "./components/ui/toggle-group.js";
export * from "./components/ui/toggle.js";
export * from "./components/ui/tooltip.js";
export { useIsMobile } from "./hooks/use-mobile.js";

// ─── The shared composites ───────────────────────────────────────────────────
export { ReadError, messageOf, type ReadErrorProps } from "./components/read-error.js";
export { Delayed, type DelayedProps } from "./components/delayed.js";
export {
  LOADING_MIN_VISIBLE_MS,
  LOADING_THRESHOLD_MS,
  useDelayedLoading,
  useLoadingPhase,
  type LoadingPhase,
} from "./hooks/use-delayed-loading.js";
export {
  EmptyState,
  type EmptyStateAction,
  type EmptyStateProps,
} from "./components/empty-state.js";
export {
  ConfirmDestructive,
  type ConfirmDestructiveProps,
} from "./components/confirm-destructive.js";
export { Tip, TruncateTip } from "./components/tip.js";
export { RelativeTime, type RelativeTimeProps } from "./components/relative-time.js";
export {
  MISSING,
  formatAbsoluteTime,
  formatRelativeTime,
  toEpochMs,
  type TimeInput,
} from "./lib/format.js";
export {
  notify,
  type NotifyAction,
  type NotifyErrorOptions,
  type NotifyOptions,
} from "./lib/notify.js";
export { createIconSet, type IconProps } from "./components/icon.js";
export {
  LanguageSwitcher,
  type LanguageOption,
  type LanguageSwitcherProps,
} from "./components/language-switcher.js";

// ─── The mark ───────────────────────────────────────────────────────────────────────────────
export { BRAND_HEX, Wordmark, type WordmarkProps } from "./brand/wordmark.js";
export { MarkGlyph, type MarkGlyphProps } from "./brand/mark-glyph.js";
export { AppIcon, type AppIconProps, type AppIconTile } from "./brand/app-icon.js";

// ─── The app frame, as parts ─────────────────────────────────────────────────
export { SidebarFrame, type SidebarFrameProps } from "./app-frame/sidebar-frame.js";
export {
  NavGroup,
  NavItem,
  type NavGroupProps,
  type NavItemProps,
  type NavLinkProps,
} from "./app-frame/nav.js";
export { TopBar, type TopBarProps } from "./app-frame/top-bar.js";
export {
  PAGE_WIDTHS,
  PageBody,
  type PageBodyProps,
  type PageWidth,
} from "./app-frame/page-body.js";
