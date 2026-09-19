import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { fontFamily, colors, radius, shadows } from "../constants/theme";

const tabs = [
  { route: "Home", label: "Início", icon: "home-outline" },
  { route: "History", label: "Prontuário", icon: "file-document-outline" },
  { route: "Monitoring", label: "Monitorar", icon: "heart-pulse" },
  { route: "Profile", label: "Perfil", icon: "account-outline" }
];

export default function BottomTab({ navigation, active = "Home" }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.shell, { bottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab) => {
        const isActive = active === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => {
              navigation.navigate(tab.route);
            }}
            activeOpacity={0.82}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={styles.item}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={23}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text
              style={[styles.label, isActive && styles.activeLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: "absolute",
    width: "92%",
    maxWidth: 680,
    alignSelf: "center",
    bottom: 14,
    minHeight: 70,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#EDF4F2",
    ...shadows.card
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    minWidth: 0
  },
  label: {
    fontFamily, fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: "900"
  }
});
