import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Platform, View } from 'react-native';
import { colors as lightColors, darkColors } from '../constants/theme';
import { readTheme, writeTheme } from '../utils/themeStorage';

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [mode, updateMode] = useState('light');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    readTheme().then(value => { if (active) updateMode(value === 'dark' ? 'dark' : 'light'); })
      .catch(() => {}).finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  const setMode = useCallback(async value => {
    if (!['light', 'dark'].includes(value)) throw new Error('Tema inválido');
    await writeTheme(value);
    updateMode(value);
  }, []);
  const colors = mode === 'dark' ? darkColors : lightColors;
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.documentElement.style.colorScheme = mode;
      document.body.style.backgroundColor = colors.background;
    }
  }, [mode, colors]);
  const value = useMemo(() => ({ mode, isDark: mode === 'dark', setMode, colors }), [mode, setMode, colors]);
  return <ThemeContext.Provider value={value}><View style={{ flex: 1, backgroundColor: colors.background }}>{ready ? children : null}</View></ThemeContext.Provider>;
}
export function useAppTheme(createStyles) {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('ThemeProvider ausente');
  const styles = useMemo(() => createStyles ? createStyles(theme.colors) : undefined, [createStyles, theme.colors]);
  return { ...theme, styles };
}
