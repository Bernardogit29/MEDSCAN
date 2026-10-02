import React, { useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { fontFamily } from '../constants/theme';

export default function ThemePreference() {
  const { colors, isDark, setMode, styles } = useAppTheme(createStyles);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);
  async function change(value) {
    if (busy.current) return;
    busy.current = true; setSaving(true); setError('');
    try { await setMode(value ? 'dark' : 'light'); }
    catch { setError('Não foi possível salvar o tema neste aparelho. Tente novamente.'); }
    finally { busy.current = false; setSaving(false); }
  }
  return <View style={styles.section}>
    <View style={styles.row}>
      <View style={styles.icon}><Icon name={isDark ? 'moon-waning-crescent' : 'white-balance-sunny'} size={23} color={colors.primary} /></View>
      <View style={styles.copy}><Text style={styles.title}>Tema escuro</Text><Text style={styles.description}>Fundo escuro com detalhes em verde-menta.</Text></View>
      <Switch accessibilityLabel="Tema escuro" value={isDark} disabled={saving} onValueChange={change} trackColor={{false:colors.switchOff,true:colors.primary}} thumbColor={colors.white} />
    </View>
    <Text style={styles.description}>{saving ? 'Salvando…' : 'Aplicado e salvo automaticamente neste aparelho.'}</Text>
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
  </View>;
}
const createStyles = colors => StyleSheet.create({
  section: { gap: 12, paddingBottom: 20, borderBottomWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { padding: 10, borderRadius: 12, backgroundColor: colors.primaryLight },
  copy: { flex: 1, gap: 4 }, title: { fontFamily, fontSize: 16, fontWeight: '600', color: colors.text },
  description: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.textMuted },
  error: { fontFamily, fontSize: 12, color: colors.danger }
});
