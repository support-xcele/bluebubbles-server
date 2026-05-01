import { mode } from '@chakra-ui/theme-tools';
import { useAppSelector } from './app/hooks';

// Xcelerate accent color. Override at runtime by setting the CSS variable
// `--xcelerate-accent` on :root (e.g. `:root { --xcelerate-accent: #ff0080 }`).
export const XCELERATE_ACCENT = '#ec4899';

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
        brand: {
            // Keep `brand.primary` as the accent token used throughout the UI.
            // Swapped from BlueBubbles blue (#4A96E6) to Xcelerate magenta.
            primary: XCELERATE_ACCENT
        }
    }
};
