import { useAppTheme } from "../context/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily } from "../constants/theme";

export default function Header({
  title,
  subtitle,
  onBack,
  onNotificationsPress,
  showBell = true,
  showSettings = false,
  right
}) {
  const { colors, styles } = useAppTheme(createStyles);
  return (
    <View style={styles.header}>
      <View style={styles.titleSide}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="arrow-left" size={30} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.82}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        {right}
        {showBell && onNotificationsPress ? (
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.85} onPress={onNotificationsPress}>
            <MaterialCommunityIcons name="bell-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
        {showSettings ? (
          <TouchableOpacity style={styles.plainIcon} activeOpacity={0.85}>
            <MaterialCommunityIcons name="cog-outline" size={30} color={colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 22
  },
  titleSide: {
    flex: 1
  },
  backButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    marginBottom: 8
  },
  title: {
    color: colors.text,
    fontFamily, fontSize: 27,
    fontWeight: "700",
    letterSpacing: 0
  },
  subtitle: {
    marginTop: 6,
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "400",
    lineHeight: 21
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  plainIcon: {
    width: 42,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#FF1F2D",
    position: "absolute",
    top: 7,
    right: 9,
    borderWidth: 2,
    borderColor: colors.primaryLight
  }
});
