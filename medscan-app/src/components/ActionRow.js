import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, radius } from "../constants/theme";

export default function ActionRow({
  title,
  subtitle,
  icon,
  color,
  onPress,
  selected = false
}) {
  const { colors, styles } = useAppTheme(createStyles);
  color = color || colors.primary;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.row, selected && styles.selected]}
    >
      <View style={[styles.icon, { backgroundColor: `${color}16` }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={30} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  row: {
    minHeight: 74,
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.selectedSurface
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    minWidth: 0
  },
  title: {
    color: colors.text,
    fontFamily, fontSize: 15,
    fontWeight: "600"
  },
  subtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily, fontSize: 12,
    fontWeight: "600",
    lineHeight: 20
  }
});
