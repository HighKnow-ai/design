/**
 * The marketing parts' shared geometry. A marketing page is wider than a reading surface, so its
 * container is its own (the audit's S2): 1200 px, with a 16 px gutter on a phone and 32 px above.
 *
 * `--page` is the page's own colour, which the header and the plain bands paint. It falls back to
 * the floor; the apex sets it to the card colour in light, so its page is white.
 */
export const MARKETING_CONTAINER = "mx-auto w-full max-w-[1200px] px-4 sm:px-8";

export const PAGE_GROUND = "bg-(--page,var(--background))";
