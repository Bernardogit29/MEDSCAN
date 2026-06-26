import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../constants/theme";

export default function HealthCard({ title, value, unit, icon, color = colors.primary, status = "Normal" }) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon} size={34} color={color} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <View style={styles.badge}>
        <View style={styles.statusDot} />
        <Text style={styles.badgeText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 176,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#EEF4F2",
    ...shadows.card
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  value: {
    color: colors.text,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0
  },
  unit: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  badge: {
    backgroundColor: "#DDF7E5",
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
    color: "#11762D",
    fontSize: 12,
    fontWeight: "900"
  }
});
