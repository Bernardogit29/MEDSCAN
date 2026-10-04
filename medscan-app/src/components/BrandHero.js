import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { useDesktop } from "../utils/responsive";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { HeaderArtwork } from "./HomeArtwork";

export default function BrandHero({ title, subtitle, badge, onBack, onNotifications, desktop = false }) {
  const { colors, styles, isDark } = useAppTheme(createStyles);
  const wide = useDesktop();
  return (
    <LinearGradient colors={[colors.heroStart, colors.heroEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.hero, wide && { borderRadius: 28, padding: 32 }, desktop && styles.desktopHero]}>
      <HeaderArtwork dark={isDark} />
      <View style={styles.brandRow}>
        <View style={styles.brand}>
          {onBack ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.brandIcon}><MaterialCommunityIcons name="arrow-left" size={21} color="white" /></TouchableOpacity> : <View style={styles.brandIcon}><MaterialCommunityIcons name="pulse" size={21} color="white" /></View>}
          <Text style={styles.brandName}>MEDSCAN</Text>
        </View>
        {onNotifications ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notificações" onPress={onNotifications} style={styles.bell}><MaterialCommunityIcons name="bell-outline" size={21} color={colors.primary} /></TouchableOpacity> : null}
      </View>
      <Text style={[styles.title, desktop && styles.desktopTitle]}>{title}</Text>
      <Text style={[styles.subtitle, desktop && styles.desktopSubtitle]}>{subtitle}</Text>
      {badge ? <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>{badge}</Text></View> : null}
    </LinearGradient>
  );
}

const createStyles = (colors) => StyleSheet.create({
  desktopHero: { flex: 1, minWidth: 0, minHeight: 520, borderRadius: 32, padding: 40, paddingTop: 40, paddingBottom: 40, justifyContent: "center" },
  desktopTitle: { fontSize: 42, lineHeight: 48, letterSpacing: -1.4 },
  desktopSubtitle: { fontSize: 16, lineHeight: 25, marginTop: 16 },
  hero: { backgroundColor: colors.hero, padding: 24, paddingTop: 22, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: "hidden" },
  halo: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 25, borderColor: "#ffffff06", backgroundColor: colors.heroHalo, right: -85, bottom: -120 },
  innerHalo: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: "#ffffff18", right: -55, bottom: -90 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#076457", alignItems: "center", justifyContent: "center" },
  brandName: { color: colors.primary, fontFamily, fontWeight: "700", fontSize: 17, letterSpacing: -0.4 },
  bell: { width: 42, height: 42, borderRadius: 16, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontFamily, fontWeight: "700", fontSize: 29, letterSpacing: -1 },
  subtitle: { color: colors.text, opacity: 0.8, fontFamily, fontSize: 14, lineHeight: 21, marginTop: 6 },
  status: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginTop: 22, backgroundColor: colors.primaryLight, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#72E2BE" },
  statusText: { color: colors.primary, fontFamily, fontSize: 12, fontWeight: "600" }
});
