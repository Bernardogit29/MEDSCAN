import React from "react";
import { StyleSheet, Text } from "react-native";
import { fontFamily } from "../constants/theme";

/**
 * Shared MEDSCAN wordmark. Keeping it as text makes the mark sharp at every
 * screen size and lets it retain contrast in both application themes.
 */
export default function MedscanWordmark({ size = 20, dark = "#075E52", light = "#8DD5C6", style }) {
  return (
    <Text accessibilityLabel="MEDSCAN" style={[styles.wordmark, { fontSize: size, lineHeight: Math.round(size * 1.02) }, style]}>
      <Text style={{ color: dark }}>MED</Text><Text style={{ color: light }}>SCAN</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontFamily,
    fontWeight: "900",
    letterSpacing: -1.1,
    includeFontPadding: false,
  },
});
