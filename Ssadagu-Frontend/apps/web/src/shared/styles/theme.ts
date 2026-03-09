// design.pen $variables 기반 디자인 토큰

export const colors = {
  primary: '#3182F6',
  bg: '#F2F4F6',
  surface: '#FFFFFF',
  textPrimary: '#191F28',
  textSecondary: '#8B95A1',
  border: '#E5E8EB',
  disabled: '#D1D6DB',
  red: '#F04452',
  chatMine: '#3182F6',
  chatOther: '#F2F4F6',
  inactiveTab: '#ADB5BD',
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  textWhite: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.4)',
} as const;

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.10)',
  lg: '0 8px 24px rgba(0,0,0,0.14)',
} as const;

export const zIndex = {
  header: 10,
  bottomNav: 20,
  modal: 50,
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  pill: '999px',
} as const;

export const typography = {
  fontFamily: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  size: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

// 모바일 앱 기준 너비
export const APP_WIDTH = 390;
export const BOTTOM_NAV_HEIGHT = 84;
export const HEADER_HEIGHT = 56;
export const STATUS_BAR_HEIGHT = 54;
