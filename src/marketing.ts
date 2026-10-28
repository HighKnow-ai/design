/**
 * @highknow/design/marketing: the parts a marketing page is built from. The apex
 * is built from them and the gallery shows them; AN APP NEVER IMPORTS THIS ENTRY. The parts compose
 * the root entry's primitives and mark, which a page imports from `@highknow/design` itself.
 */
export { SiteHeader, type SiteHeaderProps } from "./marketing/site-header.js";
export {
  FooterColumn,
  SiteFooter,
  type FooterColumnProps,
  type SiteFooterProps,
} from "./marketing/site-footer.js";
export { Section, type SectionProps } from "./marketing/section.js";
export {
  Hero,
  HeroIndex,
  type HeroIndexItem,
  type HeroIndexProps,
  type HeroProps,
} from "./marketing/hero.js";
export {
  FeatureGrid,
  type FeatureGridItem,
  type FeatureGridProps,
} from "./marketing/feature-grid.js";
export { CallToAction, type CallToActionProps } from "./marketing/call-to-action.js";
export { MARKETING_CONTAINER } from "./marketing/layout.js";
