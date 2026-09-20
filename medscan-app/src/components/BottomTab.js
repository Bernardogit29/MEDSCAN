import React from "react";
import { useDesktop } from "../utils/responsive";
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
  const desktop = useDesktop();
  if (desktop) return <View style={styles.sidebar}>
    <View style={styles.logo}><MaterialCommunityIcons name="pulse" size={25} color={colors.primary} /><Text style={styles.logoText}>MEDSCAN</Text></View>
    <Text style={styles.menuCaption}>SEU ESPAÇO DE SAÚDE</Text>
    {[tabs[0], { route: "Analyze", label: "Conversar com IA", icon: "creation" }, ...tabs.slice(1), { route: "Notifications", label: "Notificações", icon: "bell-outline" }].map(tab => <TouchableOpacity key={tab.route} accessibilityRole="tab" accessibilityState={{ selected: active === tab.route }} onPress={() => navigation.navigate(tab.route)} style={[styles.navItem, active === tab.route && styles.selectedNav]}><MaterialCommunityIcons name={tab.icon} size={21} color={active === tab.route ? colors.white : colors.primary} /><Text style={[styles.navLabel, active === tab.route && { color: colors.white }]}>{tab.label}</Text></TouchableOpacity>)}
    <View style={styles.sidebarFoot}><MaterialCommunityIcons name="heart-outline" size={20} color={colors.primary} /><Text style={styles.footText}>{"Seu cuidado,\nmais perto."}</Text></View>
  </View>;
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
  sidebar: { position: "fixed", left: 0, top: 0, bottom: 0, width: 240, backgroundColor: colors.white, padding: 22, borderRightWidth: 1, borderColor: colors.border, gap: 8 },
  logo: { flexDirection: "row", gap: 9, alignItems: "center", paddingVertical: 16, marginBottom: 32 },
  logoText: { fontFamily, color: colors.primary, fontSize: 19, fontWeight: "700" },
  menuCaption: { fontFamily, fontSize: 9, letterSpacing: 1.2, color: colors.textMuted, marginBottom: 14 },
  navItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 13, borderRadius: 12 },
  selectedNav: { backgroundColor: colors.primary },
  navLabel: { fontFamily, fontSize: 13, fontWeight: "600", color: colors.text },
  sidebarFoot: { marginTop: "auto", padding: 18, borderRadius: 18, backgroundColor: colors.background, gap: 10 },
  footText: { fontFamily, fontSize: 14, lineHeight: 21, color: colors.primary },
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
