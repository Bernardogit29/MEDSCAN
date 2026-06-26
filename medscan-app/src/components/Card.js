import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, shadows } from "../constants/theme";

export default function Card({ children, style, bordered = false }) {
  return (
    <View style={[styles.card, bordered && styles.bordered, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 18,
    ...shadows.card
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowOpacity: 0.04,
    elevation: 1
  }
});
