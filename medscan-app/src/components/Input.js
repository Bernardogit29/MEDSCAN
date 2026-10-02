import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, radius } from "../constants/theme";

export default function Input({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline = false,
  style
}) {
  const { colors, styles } = useAppTheme(createStyles);
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputWrapper, multiline && styles.multilineWrapper]}>
        {icon ? <MaterialCommunityIcons name={icon} size={22} color={colors.primary} /> : null}
        <TextInput
          accessibilityLabel={label || placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          selectionColor={colors.primary}
          style={[styles.input, Platform.OS === "web" && styles.webInput, multiline && styles.multilineInput]}
        />
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: colors.text,
    fontWeight: "800",
    fontFamily, fontSize: 14
  },
  inputWrapper: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  multilineWrapper: {
    minHeight: 118,
    alignItems: "flex-start",
    paddingVertical: 14
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "600"
  },
  webInput: {
    outlineStyle: "none",
    outlineWidth: 0
  },
  multilineInput: {
    minHeight: 88
  }
});
