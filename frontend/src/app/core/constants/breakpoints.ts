/**
 * Breakpoints centralisés pour le responsive design
 */

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440
} as const;

export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE}px)`,
  TABLET: `(max-width: ${BREAKPOINTS.TABLET}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP}px)`,
  MOBILE_ONLY: `(max-width: ${BREAKPOINTS.MOBILE - 1}px)`,
  TABLET_ONLY: `(min-width: ${BREAKPOINTS.MOBILE}px) and (max-width: ${BREAKPOINTS.TABLET - 1}px)`,
  DESKTOP_ONLY: `(min-width: ${BREAKPOINTS.TABLET}px)`
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;
