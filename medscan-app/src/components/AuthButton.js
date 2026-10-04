import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily } from "../constants/theme";
import { authColors } from "../constants/authTheme";

export default function AuthButton({ title, onPress, loading = false, secondary = false, style }) {
  const foreground = secondary ? authColors.text : "#103D34";
  return <Pressable accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ disabled: loading, busy: loading }} disabled={loading} onPress={onPress}
    style={({ hovered, pressed }) => [styles.button, secondary && styles.secondary, hovered && styles.hovered, (pressed || loading) && styles.pressed, style]}>
    <Text style={[styles.label, { color: foreground }]}>{title}</Text>
    {loading ? <ActivityIndicator color={foreground} /> : <MaterialCommunityIcons name="arrow-top-right" size={21} color={foreground} />}
  </Pressable>;
}

const styles = StyleSheet.create({
  button: { minHeight: 56, borderRadius: 6, paddingHorizontal: 20, paddingVertical: 14, backgroundColor: authColors.primary, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16, borderWidth: 1, borderColor: "transparent" },
  secondary: { backgroundColor: "rgba(7,28,30,0.35)", borderColor: authColors.border },
  hovered: { borderColor: "#FFFFFF" },
  pressed: { opacity: 0.75 },
  label: { fontFamily, fontSize: 15, fontWeight: "700", flexShrink: 1 }
});
