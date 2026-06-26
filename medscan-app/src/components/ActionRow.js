import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius } from "../constants/theme";

export default function ActionRow({
  title,
  subtitle,
  icon,
  color = colors.primary,
  onPress,
  selected = false
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.row, selected && styles.selected]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon} size={31} color={color} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={30} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 82,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: "#F1FBF8"
  },
  icon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  }
});
