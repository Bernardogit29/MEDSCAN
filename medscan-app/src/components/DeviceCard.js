import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, shadows } from "../constants/theme";

function iconForType(type) {
  const map = {
    wearable: "watch-variant",
    oximeter: "pulse",
    glucose: "water",
    "blood-pressure": "blood-bag",
    pressure: "blood-bag"
  };

  return map[type] || "devices";
}

export default function DeviceCard({ device }) {
  const { colors, styles } = useAppTheme(createStyles);
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name={iconForType(device.type)} size={20} color={colors.primary} />
        </View>
        <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
      </View>
      <View style={styles.statusBadge}>
        <View style={[styles.dot, !device.connected && styles.dotOff]} />
        <Text style={[styles.connected, !device.connected && styles.connectedOff]}>{device.connected ? "Conectado" : "Offline"}</Text>
      </View>
      <View style={styles.row}>
        <MaterialCommunityIcons name="battery-medium" size={18} color={colors.textMuted} />
        <Text style={styles.battery}>{device.battery || 0}%</Text>
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    flexBasis: "45%",
    flexGrow: 1,
    minWidth: 0,
    minHeight: 150,
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
    gap: 8,
    width: "100%"
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight
  },
  name: {
    color: colors.text,
    fontFamily, fontSize: 13,
    fontWeight: "800",
    flex: 1,
    maxWidth: "100%"
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success
  },
  dotOff: {
    backgroundColor: colors.textMuted
  },
  connected: {
    color: colors.successText,
    fontFamily, fontSize: 12,
    fontWeight: "700"
  },
  connectedOff: {
    color: colors.textMuted
  },
  battery: {
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "800"
  }
});
