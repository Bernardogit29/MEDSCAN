import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, colors } from "../constants/theme";

export default function Logo({ compact = false }) {
  return (
    <View style={[styles.wrapper, compact && styles.compact]}>
      <View style={styles.mark}>
        <MaterialCommunityIcons name="medical-bag" size={compact ? 20 : 28} color={colors.white} />
      </View>
      <Text style={[styles.logo, compact && styles.logoCompact]}>
        MED<Text style={styles.scan}>SCAN</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 12
  },
  compact: {
    flexDirection: "row",
    gap: 8
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  logo: {
    fontFamily, fontSize: 48,
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: 0
  },
  logoCompact: {
    fontFamily, fontSize: 26
  },
  scan: {
    color: "#7ACBBC"
  }
});
