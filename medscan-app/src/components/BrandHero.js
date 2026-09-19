import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, fontFamily } from "../constants/theme";

export default function BrandHero({ title, subtitle, badge, onBack, onNotifications }) {
  return (
    <View style={styles.hero}>
      <View pointerEvents="none" style={styles.halo} />
      <View pointerEvents="none" style={styles.innerHalo} />
      <View style={styles.brandRow}>
        <View style={styles.brand}>
          {onBack ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={onBack} style={styles.brandIcon}><MaterialCommunityIcons name="arrow-left" size={21} color="white" /></TouchableOpacity> : <View style={styles.brandIcon}><MaterialCommunityIcons name="pulse" size={21} color="white" /></View>}
          <Text style={styles.brandName}>MEDSCAN</Text>
        </View>
        {onNotifications ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notificações" onPress={onNotifications} style={styles.bell}><MaterialCommunityIcons name="bell-outline" size={21} color="white" /></TouchableOpacity> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {badge ? <View style={styles.status}><View style={styles.dot} /><Text style={styles.statusText}>{badge}</Text></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.primary, padding: 24, paddingTop: 22, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: "hidden" },
  halo: { position: "absolute", width: 240, height: 240, borderRadius: 120, borderWidth: 25, borderColor: "#ffffff06", backgroundColor: "#0B806D", right: -85, bottom: -120 },
  innerHalo: { position: "absolute", width: 180, height: 180, borderRadius: 90, borderWidth: 1, borderColor: "#ffffff18", right: -55, bottom: -90 },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#ffffff16", borderWidth: 1, borderColor: "#ffffff30", alignItems: "center", justifyContent: "center" },
  brandName: { color: "white", fontFamily, fontWeight: "700", fontSize: 15, letterSpacing: -0.4 },
  bell: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#ffffff14", borderWidth: 1, borderColor: "#ffffff30", alignItems: "center", justifyContent: "center" },
  title: { color: "white", fontFamily, fontWeight: "700", fontSize: 27, letterSpacing: -1 },
  subtitle: { color: "#D0EBE3", fontFamily, fontSize: 14, lineHeight: 21, marginTop: 5 },
  status: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, marginTop: 22, backgroundColor: "#ffffff0D", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#72E2BE" },
  statusText: { color: "#D4F9EB", fontFamily, fontSize: 12, fontWeight: "600" }
});
