import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import { radius, shadows } from "../constants/theme";

export default function Card({ children, style, bordered = false }) {
  const { colors, styles } = useAppTheme(createStyles);
  return (
    <View style={[styles.card, bordered && styles.bordered, style]}>
      {children}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0.04,
    elevation: 1
  }
});
