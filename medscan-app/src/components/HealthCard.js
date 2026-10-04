import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, shadows } from "../constants/theme";
import { VitalSparkline } from "./HomeArtwork";
import { useDesktop } from "../utils/responsive";

export default function HealthCard({ title, value, unit, icon, color, status = "Normal", pulse = false, bars = false }) {
  const { colors, styles } = useAppTheme(createStyles);
  const desktop = useDesktop();
  color = color || colors.primary;
  return (
    <View style={[styles.card, desktop && { flexBasis: "22%", minHeight: 220, padding: 20 }]}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${color}18` }]}>
          <MaterialCommunityIcons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      {status === "Demonstração" ? <View style={{ width: "100%" }}><VitalSparkline color={color} pulse={pulse} bars={bars} /><Text style={styles.unit}>Ilustração · sem histórico de medições</Text></View> : null}
      <View style={styles.badge}>
        <View style={styles.statusDot} />
        <Text style={styles.badgeText}>{value == null || value === "—" ? "Sem medição" : status}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 0,
    minHeight: 184,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    width: "100%"
  },
  iconCircle: {
    width: 27,
    height: 27,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    flex: 1,
    color: colors.textMuted,
    fontFamily, fontSize: 12,
    fontWeight: "600"
  },
  value: {
    color: colors.text,
    fontFamily, fontSize: 25,
    fontWeight: "700",
    letterSpacing: 0
  },
  unit: {
    color: colors.textMuted,
    fontFamily, fontSize: 10,
    fontWeight: "600"
  },
  badge: {
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success
  },
  badgeText: {
    color: colors.successText,
    fontFamily, fontSize: 12,
    fontWeight: "700"
  }
});
