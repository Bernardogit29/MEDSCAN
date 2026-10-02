import { useAppTheme } from "../context/ThemeContext";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Card from "./Card";
import { fontFamily } from "../constants/theme";
import { timelineDate, timelineEntry } from "../utils/caseTimeline";

export default function CaseTimeline({ versions, selectedId, onSelect, disabled, loading, error, onRetry }) {
  const { colors, styles: s } = useAppTheme(createStyles);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(null);
  if (!versions.length) return null;
  const selected = versions.find(version => String(version._id) === String(selectedId));
  const subtitle = versions.length === 1
    ? "Seu primeiro registro está salvo"
    : `${versions.length} registros · ${selected ? timelineEntry(selected, versions).title : "Orientação selecionada"}`;
  return <Card style={s.card}>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Histórico deste relato" accessibilityState={{ expanded: visible, disabled: !!disabled }} disabled={disabled} onPress={() => setVisible(value => !value)} style={s.heading}>
      <View style={s.headingIcon}><Icon name="history" size={22} color={colors.primary} /></View>
      <View style={s.grow}><Text style={s.title}>Histórico deste relato</Text><Text style={s.muted}>{subtitle}</Text></View>
      <Icon name={visible ? "chevron-up" : "chevron-down"} size={22} color={colors.primary} />
    </TouchableOpacity>
    {loading ? <Text style={s.status}>Atualizando registros…</Text> : null}
    {error ? <View style={s.notice}><Text accessibilityRole="alert" style={s.muted}>{error}</Text><TouchableOpacity accessibilityRole="button" disabled={disabled} onPress={onRetry} style={s.retry}><Text style={s.link}>Tentar novamente</Text></TouchableOpacity></View> : null}
    {visible ? <View style={s.history}>
      <Text style={s.intro}>Cada complemento fica salvo com a orientação que você recebeu naquele momento.</Text>
      {[...versions].reverse().map(version => {
        const id = String(version._id);
        const entry = timelineEntry(version, versions);
        const open = expanded === id;
        const current = String(selectedId) === id;
        const latest = String(versions.at(-1)?._id) === id;
        return <View key={id} style={s.event}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${entry.title}, ${timelineDate(version.createdAt)}${current ? ", em exibição" : ""}`} accessibilityState={{ expanded: open, disabled: !!disabled }} disabled={disabled} onPress={() => setExpanded(open ? null : id)} style={s.eventHeading}>
            <View style={[s.dot, current && s.selectedDot]} />
            <View style={s.grow}>
              <Text style={s.eventTitle}>{entry.title}</Text>
              <Text style={s.muted}>{timelineDate(version.createdAt)}</Text>
              {current || latest ? <Text style={s.selectedText}>{current ? "Em exibição" : "Mais recente"}</Text> : null}
            </View>
            <Icon name={open ? "minus" : "plus"} size={19} color={colors.primary} />
          </TouchableOpacity>
          {open ? <View style={s.details}>
            {entry.parentLabel ? <Text style={s.muted}>{entry.parentLabel}</Text> : null}
            <Text style={s.caption}>{entry.isOriginal ? "Seu relato" : "O que você acrescentou"}</Text>
            <Text selectable style={s.copy}>{entry.input || entry.inputMissing}</Text>
            {version.imageUrl ? <Text style={s.muted}>Imagem anexada a este registro</Text> : null}
            {!current ? <>
              <Text style={s.caption}>Resumo da orientação</Text>
              <Text selectable style={s.copy}>{entry.summary}</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Ver orientação completa: ${entry.title}`} disabled={disabled} onPress={() => onSelect(version)} style={s.openButton}><Text style={s.link}>Ver esta orientação</Text><Icon name="arrow-right" size={18} color={colors.primary} /></TouchableOpacity>
            </> : <Text style={s.muted}>A orientação deste registro está aberta nesta página.</Text>}
          </View> : null}
        </View>;
      })}
    </View> : null}
  </Card>;
}

const createStyles = (colors) => StyleSheet.create({
  card: { padding: 0, overflow: "hidden", borderRadius: 20 },
  heading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, minHeight: 80 },
  headingIcon: { width: 36, height: 36, backgroundColor: colors.primaryLight, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  grow: { flex: 1, minWidth: 0 },
  title: { fontFamily, fontSize: 15, fontWeight: "700", color: colors.text, lineHeight: 21 },
  muted: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.textMuted },
  status: { fontFamily, fontSize: 12, color: colors.textMuted, paddingHorizontal: 16, paddingBottom: 12 },
  history: { paddingHorizontal: 16, borderTopWidth: 1, borderColor: colors.border },
  intro: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.textMuted, paddingVertical: 14 },
  event: { borderTopWidth: 1, borderColor: colors.border },
  eventHeading: { paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 12, minHeight: 64 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border },
  selectedDot: { backgroundColor: colors.hero },
  eventTitle: { fontFamily, fontSize: 14, color: colors.text, fontWeight: "600", lineHeight: 21 },
  selectedText: { fontFamily, fontSize: 11, color: colors.primary, marginTop: 3, fontWeight: "600" },
  details: { paddingBottom: 16, gap: 8 },
  caption: { fontFamily, fontSize: 12, fontWeight: "700", color: colors.text, marginTop: 4 },
  copy: { fontFamily, fontSize: 14, lineHeight: 23, color: colors.text },
  openButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, padding: 12, minHeight: 44, backgroundColor: colors.primaryLight, borderRadius: 12, marginTop: 4 },
  link: { fontFamily, fontSize: 13, fontWeight: "600", color: colors.primary },
  notice: { paddingHorizontal: 16, paddingBottom: 12 },
  retry: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }
});
