import { mode } from '@chakra-ui/theme-tools';
import { useAppSelector } from './app/hooks';

// Xcelerate accent color. Override at runtime by setting the CSS variable
// `--xcelerate-accent` on :root (e.g. `:root { --xcelerate-accent: #ff0080 }`).
export const XCELERATE_ACCENT = '#ee6c30';

// macOS Tahoe "liquid glass" tokens. Tuned for a pure-black canvas:
// heavy backdrop blur + saturation, soft inner highlight, layered shadows.
export const XCELERATE_BG = '#000000';
export const GLASS_SURFACE = 'rgba(255,255,255,0.045)';
export const GLASS_BORDER = 'rgba(255,255,255,0.10)';
export const GLASS_HOVER = 'rgba(255,255,255,0.075)';
export const GLASS_BLUR = 'blur(40px) saturate(180%)';
export const GLASS_INNER_GLOW =
    'inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)';

export const baseTheme = {
    config: {
        initialColorMode: 'system',
        useSystemColorMode: false
    },
    styles: {
        global: (props: any) => {
            const useOled = useAppSelector(state => state.config.use_oled_dark_mode ?? false);
            return {
                ':root': {
                    '--xcelerate-accent': XCELERATE_ACCENT
                },
                'html, body': {
                    bg: mode('white', (useOled) ? XCELERATE_BG : XCELERATE_BG)(props),
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    letterSpacing: '-0.011em',
                    fontFeatureSettings: '"ss01", "cv11"'
                },
                body: {
                    bg: mode('white', (useOled) ? XCELERATE_BG : XCELERATE_BG)(props)
                },
                '*': {
                    transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '::-webkit-scrollbar': { width: '6px', height: '6px' },
                '::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '3px'
                },
                '::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255,255,255,0.25)'
                }
            };
        },
    },
    colors: {
        brand: {
            // Keep `brand.primary` as the accent token used throughout the UI.
            primary: XCELERATE_ACCENT
        }
    },
    components: {
        Box: {
            variants: {
                glass: {
                    bg: GLASS_SURFACE,
                    backdropFilter: GLASS_BLUR,
                    WebkitBackdropFilter: GLASS_BLUR,
                    border: '1px solid',
                    borderColor: GLASS_BORDER,
                    borderRadius: '14px',
                    boxShadow: GLASS_INNER_GLOW,
                    transition: 'background 200ms ease, border-color 200ms ease',
                    _hover: {
                        bg: GLASS_HOVER,
                        borderColor: 'rgba(255,255,255,0.18)'
                    }
                }
            }
        }
    }
};
