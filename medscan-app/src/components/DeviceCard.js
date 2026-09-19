import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, colors, radius, shadows } from "../constants/theme";

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
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={iconForType(device.type)} size={34} color={colors.primary} />
      </View>
      <Text style={styles.name} numberOfLines={1}>{device.name}</Text>
      <View style={styles.row}>
        <View style={[styles.dot, !device.connected && styles.dotOff]} />
        <Text style={styles.connected}>{device.connected ? "Conectado" : "Offline"}</Text>
      </View>
      <View style={styles.row}>
        <MaterialCommunityIcons name="battery-medium" size={18} color={colors.text} />
        <Text style={styles.battery}>{device.battery || 0}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 154,
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
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight
  },
  name: {
    color: colors.text,
    fontFamily, fontSize: 15,
    fontWeight: "900",
    maxWidth: "100%"
  },
  row: {
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
    color: colors.success,
    fontFamily, fontSize: 13,
    fontWeight: "800"
  },
  battery: {
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "800"
  }
});
