import { Platform, useWindowDimensions } from 'react-native';
export function useDesktop() { const { width } = useWindowDimensions(); return Platform.OS === 'web' && width >= 1100; }
export const desktopPage = { paddingLeft: 240 };
export const desktopContent = { maxWidth: 1200, padding: 32, paddingBottom: 48 };
