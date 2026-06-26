import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius, shadows } from "../constants/theme";

const tabs = [
  { route: "Home", label: "Início", icon: "home" },
  { route: "History", label: "Histórico", icon: "file-document-outline" },
  { route: "Monitoring", label: "Monitoramento", icon: "heart-pulse" },
  { route: "Profile", label: "Perfil", icon: "account-outline" }
];

export default function BottomTab({ navigation, active = "Home" }) {
  return (
    <View style={styles.shell}>
      {tabs.map((tab) => {
        const isActive = active === tab.route;
        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => {
              if (!isActive) navigation.navigate(tab.route);
            }}
            activeOpacity={0.82}
            style={styles.item}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={30}
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
    left: 18,
    right: 18,
    bottom: 14,
    minHeight: 82,
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
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "700",
    letterSpacing: 0
  },
  activeLabel: {
    color: colors.primary,
    fontWeight: "900"
  }
});
