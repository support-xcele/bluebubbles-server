import { mode } from '@chakra-ui/theme-tools';
import { useAppSelector } from './app/hooks';

// Xcelerate Management accent color. Override at runtime by setting the CSS variable
// `--xcelerate-accent` on :root (e.g. `:root { --xcelerate-accent: #ff0080 }`).
export const XCELERATE_ACCENT = '#ee6c30';
export const XCELERATE_ACCENT_START = '#e6422a';
export const XCELERATE_ACCENT_END = '#f5a23a';
export const XCELERATE_BG = '#0a0908';
export const XCELERATE_GRADIENT = 'linear-gradient(135deg, #e6422a 0%, #ee6c30 50%, #f5a23a 100%)';

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
                    '--xcelerate-accent': XCELERATE_ACCENT,
                    '--xcelerate-accent-start': XCELERATE_ACCENT_START,
                    '--xcelerate-accent-end': XCELERATE_ACCENT_END,
                    '--xcelerate-bg': XCELERATE_BG,
                    '--xcelerate-gradient': XCELERATE_GRADIENT
                },
                body: {
                    bg: mode('white', (useOled) ? 'black' : 'gray.800')(props)
                },
            };
        },
    },
    colors: {
        brand: {
            // Keep `brand.primary` as the accent token used throughout the UI.
            // Xcelerate Management orange-gradient accent.
            primary: XCELERATE_ACCENT
        }
    }
};
