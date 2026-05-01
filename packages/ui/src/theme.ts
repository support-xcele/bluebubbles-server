import { mode } from '@chakra-ui/theme-tools';
import { useAppSelector } from './app/hooks';

// Xcelerate accent color. Override at runtime by setting the CSS variable
// `--xcelerate-accent` on :root (e.g. `:root { --xcelerate-accent: #ff0080 }`).
export const XCELERATE_ACCENT = '#e6422a';

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
                body: {
                    bg: mode('white', (useOled) ? 'black' : 'gray.800')(props)
                },
            };
        },
    },
    colors: {
        pink: {
            // Override Chakra's default pink scheme so any colorScheme="pink"
            // throughout the app renders as Xcelerate brand red instead.
            50:  '#fef2f0',
            100: '#fde0db',
            200: '#fac0b6',
            300: '#f6957f',
            400: '#ee6c30',
            500: '#e6422a',
            600: '#c43522',
            700: '#9b2a1a',
            800: '#722013',
            900: '#4a150c',
        },
        brand: {
            // Keep `brand.primary` as the accent token used throughout the UI.
            // Swapped from BlueBubbles blue (#4A96E6) to Xcelerate magenta.
            primary: XCELERATE_ACCENT
        }
    }
};
