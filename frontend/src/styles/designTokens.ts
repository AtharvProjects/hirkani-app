/**
 * HIRKANI Design System - Design Tokens
 *
 * Design tokens are the visual design atoms of the design system.
 * They are used to maintain consistency across the application.
 *
 * PHASE 6 - Design System
 * Status: NEW
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary - Pregnancy & Care
  primary: {
    50: '#FFF5F7',
    100: '#FFE4E9',
    200: '#FFC9D4',
    300: '#FF9DB0',
    400: '#FF6B8A',
    500: '#FF3D6B', // Main brand color - warm, nurturing
    600: '#E62857',
    700: '#C41945',
    800: '#9E0F37',
    900: '#7A0729',
  },

  // Secondary - Trust & Safety
  secondary: {
    50: '#F0F7FF',
    100: '#E0EFFF',
    200: '#BAD7FF',
    300: '#8ABFFF',
    400: '#52A0FF',
    500: '#2B82FF', // Trust, reliability
    600: '#1B6BE0',
    700: '#1055C2',
    800: '#0A429E',
    900: '#05307A',
  },

  // Success - Safe, Approved
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // Safe food indicator
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning - Caution
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Caution indicator
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Danger - Avoid
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Avoid indicator
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral - Text & Backgrounds
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Pregnancy-specific
  trimester: {
    first: '#FFE4E9',   // Light pink
    second: '#FFB8D0',  // Medium pink
    third: '#FF8AB0',   // Deep pink
  },

  // Status colors
  status: {
    appropriate: '#22C55E',
    caution: '#F59E0B',
    limit: '#FB923C',
    avoid: '#EF4444',
    unknown: '#A3A3A3',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Poppins", "Inter", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },

  // Font sizes (with line heights)
  fontSize: {
    xs: { size: '0.75rem', lineHeight: '1rem' },      // 12px
    sm: { size: '0.875rem', lineHeight: '1.25rem' },  // 14px
    base: { size: '1rem', lineHeight: '1.5rem' },     // 16px
    lg: { size: '1.125rem', lineHeight: '1.75rem' },  // 18px
    xl: { size: '1.25rem', lineHeight: '1.75rem' },   // 20px
    '2xl': { size: '1.5rem', lineHeight: '2rem' },    // 24px
    '3xl': { size: '1.875rem', lineHeight: '2.25rem' }, // 30px
    '4xl': { size: '2.25rem', lineHeight: '2.5rem' }, // 36px
    '5xl': { size: '3rem', lineHeight: '1' },         // 48px
    '6xl': { size: '3.75rem', lineHeight: '1' },      // 60px
  },

  // Font weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
  40: '10rem',    // 160px
  48: '12rem',    // 192px
  56: '14rem',    // 224px
  64: '16rem',    // 256px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  button: {
    height: {
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
    },
    padding: {
      sm: { x: spacing[3], y: spacing[1] },
      md: { x: spacing[4], y: spacing[2] },
      lg: { x: spacing[6], y: spacing[3] },
    },
    fontSize: {
      sm: typography.fontSize.sm.size,
      md: typography.fontSize.base.size,
      lg: typography.fontSize.lg.size,
    },
  },

  input: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
    },
    padding: {
      x: spacing[3],
    },
    borderWidth: '1px',
    focusRingWidth: '2px',
  },

  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    borderRadius: borderRadius.lg,
    shadow: shadows.base,
  },

  badge: {
    padding: {
      x: spacing[2],
      y: spacing[1],
    },
    fontSize: typography.fontSize.xs.size,
    borderRadius: borderRadius.full,
  },

  avatar: {
    size: {
      xs: '1.5rem',  // 24px
      sm: '2rem',    // 32px
      md: '2.5rem',  // 40px
      lg: '3rem',    // 48px
      xl: '4rem',    // 64px
    },
  },
} as const;

// ============================================================================
// PREGNANCY-SPECIFIC TOKENS
// ============================================================================

export const pregnancy = {
  trimester: {
    1: {
      color: colors.trimester.first,
      label: 'First Trimester',
      weeks: '1-13',
    },
    2: {
      color: colors.trimester.second,
      label: 'Second Trimester',
      weeks: '14-27',
    },
    3: {
      color: colors.trimester.third,
      label: 'Third Trimester',
      weeks: '28-40',
    },
  },

  foodStatus: {
    appropriate: {
      color: colors.status.appropriate,
      icon: '✓',
      label: 'Generally Appropriate',
    },
    caution: {
      color: colors.status.caution,
      icon: '⚠',
      label: 'Use Caution',
    },
    limit: {
      color: colors.status.limit,
      icon: '⊘',
      label: 'Limit Intake',
    },
    avoid: {
      color: colors.status.avoid,
      icon: '✕',
      label: 'Avoid',
    },
    unknown: {
      color: colors.status.unknown,
      icon: '?',
      label: 'Insufficient Data',
    },
  },

  scoreColors: {
    excellent: colors.success[500],  // 90-100
    good: colors.success[400],       // 70-89
    fair: colors.warning[500],       // 50-69
    poor: colors.danger[400],        // 30-49
    veryPoor: colors.danger[600],    // 0-29
  },
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Color = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof borderRadius;
export type Shadow = keyof typeof shadows;
export type Breakpoint = keyof typeof breakpoints;
export type ZIndex = keyof typeof zIndex;

// ============================================================================
// DESIGN TOKEN EXPORT
// ============================================================================

export const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  zIndex,
  transitions,
  components,
  pregnancy,
} as const;

export default designTokens;
