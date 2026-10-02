import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, radius, shadows } from "../constants/theme";

export default function HealthCard({ title, value, unit, icon, color, status = "Normal" }) {
  const { colors, styles } = useAppTheme(createStyles);
  color = color || colors.primary;
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <View style={styles.badge}>
        <View style={styles.statusDot} />
        <Text style={styles.badgeText}>{value == null || value === "—" ? "Sem medição" : status}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.text,
    fontFamily, fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  value: {
    color: colors.text,
    fontFamily, fontSize: 25,
    fontWeight: "700",
    letterSpacing: 0
  },
  unit: {
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "700"
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
