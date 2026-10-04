import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { authColors as colors } from "../constants/authTheme";
import { fontFamily } from "../constants/theme";

export default function AuthInput({ label, icon, secureTextEntry = false, style, ...props }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return <View style={[styles.field, style]}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.control, focused && styles.focused, props.editable === false && styles.disabled]}>
      <MaterialCommunityIcons name={icon} size={20} color={focused ? colors.primary : colors.textMuted} />
      <TextInput {...props} accessibilityLabel={label} secureTextEntry={secureTextEntry && !visible}
        autoCapitalize={props.autoCapitalize || "none"} autoCorrect={false}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted} selectionColor={colors.primary}
        style={[styles.input, Platform.OS === "web" && styles.webInput]} />
      {secureTextEntry && <Pressable accessibilityRole="button" accessibilityLabel={visible ? `Ocultar ${label.toLowerCase()}` : `Mostrar ${label.toLowerCase()}`}
        accessibilityState={{ checked: visible }} onPress={() => setVisible(value => !value)} style={styles.visibility}>
        <MaterialCommunityIcons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
      </Pressable>}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  field: { gap: 8, minWidth: 0 },
  label: { fontFamily, fontSize: 12, lineHeight: 18, fontWeight: "600", color: colors.text },
  control: { minHeight: 54, borderWidth: 1, borderColor: colors.border, borderRadius: 6, backgroundColor: colors.background, paddingLeft: 15, paddingRight: 6, flexDirection: "row", alignItems: "center", gap: 10 },
  focused: { borderColor: colors.primary, backgroundColor: "rgba(34,72,66,0.8)" },
  disabled: { opacity: 0.65 },
  input: { flex: 1, minWidth: 0, minHeight: 52, fontFamily, fontSize: 16, color: colors.text, paddingVertical: 12, paddingRight: 8 },
  webInput: { outlineStyle: "none" },
  visibility: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center", borderRadius: 10 }
});
