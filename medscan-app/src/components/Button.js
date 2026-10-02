import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, radius, shadows } from "../constants/theme";

export default function Button({
  title,
  onPress,
  icon,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  textStyle
}) {
  const { colors, styles } = useAppTheme(createStyles);
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";
  const isSoft = variant === "soft";

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      activeOpacity={0.86}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary && styles.primary,
        isOutline && styles.outline,
        isSoft && styles.soft,
        (disabled || loading) && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={22}
              color={isPrimary ? colors.white : colors.primary}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              isPrimary && styles.primaryText,
              (isOutline || isSoft) && styles.secondaryText,
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors) => StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10
  },
  primary: {
    backgroundColor: colors.hero,
    ...shadows.soft
  },
  outline: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primaryMedium
  },
  soft: {
    backgroundColor: colors.primaryLight
  },
  disabled: {
    opacity: 0.65
  },
  text: {
    fontFamily, fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0
  },
  primaryText: {
    color: colors.white
  },
  secondaryText: {
    color: colors.primary
  }
});
