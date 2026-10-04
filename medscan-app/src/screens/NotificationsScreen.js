import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import BrandHero from "../components/BrandHero";
import { fontFamily, radius, shadows } from "../constants/theme";


function iconForType(type) {
  if (type === "alert") return "alert-outline";
  if (type === "device") return "devices";
  if (type === "recommendation") return "hospital-building";
  if (type === "reminder") return "clock-outline";
  return "file-check-outline";
}

function colorForType(type, colors) {
  if (type === "alert") return colors.warning;
  if (type === "recommendation") return colors.danger;
  if (type === "device") return colors.info;
  return colors.primary;
}

export default function NotificationsScreen({ navigation }) {
  const { colors, styles } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    setItems([]);
    setMessage(token ? "Carregando atualizações…" : "Entre na conta para consultar suas atualizações.");
    async function load() {
      try {
        const { data } = await api.get("/profile");
        if (!active) return;
        const settings = data.profile?.settings || {};
        if (settings.notifications === false) { setMessage("Atualizações desativadas. Você pode reativá-las no perfil."); return; }
        const response = await api.get("/history?personId=self");
        if (!active) return;
        const records = Array.isArray(response.data) ? response.data : [];
        setItems(records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20).map(item => ({
          _id: item._id, type: "analysis", title: "Análise disponível", description: settings.appPreferences?.hideHealthPreviews ? "Toque para consultar seu registro" : item.possibleCondition || "Sua análise está salva", time: new Date(item.createdAt).toLocaleString("pt-BR"), analysis: item
        })));
        setMessage(records.length ? "" : "Suas análises salvas aparecerão aqui.");
      } catch (_) { if (active) setMessage("Não foi possível carregar suas atualizações. Tente atualizar."); }
    }
    if (token) load();
    return () => { active = false; };
  }, [token, revision]));
  return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]}>
      <ScrollView contentContainerStyle={[styles.content, desktop && desktopContent]} showsVerticalScrollIndicator={false}>
        <BrandHero
          title="Notificações"
          subtitle="Suas análises recentes, em um só lugar"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.body}>

        <View style={styles.list}>
          {message ? <Text style={styles.description}>{message}</Text> : null}
          {items.map((notification) => {
            const itemColor = colorForType(notification.type, colors);

            return (
              <TouchableOpacity key={notification._id} style={styles.item} activeOpacity={0.86} accessibilityRole="button" onPress={() => navigation.navigate("Result", { analysis: notification.analysis })}>
                <View style={[styles.iconBox, { backgroundColor: `${itemColor}18` }]}>
                  <MaterialCommunityIcons
                    name={iconForType(notification.type)}
                    size={28}
                    color={itemColor}
                  />
                </View>
                <View style={styles.copy}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.title}>{notification.title}</Text>
                    {notification.unread ? <View style={styles.unreadDot} /> : null}
                  </View>
                  <Text style={styles.description} numberOfLines={2}>
                    {notification.description}
                  </Text>
                  <Text style={styles.time}>{notification.time}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={26} color={colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>
        <Button title={token ? "Atualizar" : "Entrar na conta"} variant="soft" onPress={() => token ? setRevision(value => value + 1) : navigation.navigate("Login", { returnToPrevious: true })} />
        <Button title="Configurar no perfil" variant="outline" onPress={() => navigation.navigate("Profile")} />
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Notifications" />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 130 },
  body: { padding: 20, gap: 17 },
  list: {
    gap: 14
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 6,
    minWidth: 0
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  title: {
    flex: 1,
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700"
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger
  },
  description: {
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  time: {
    color: colors.primary,
    fontFamily, fontSize: 13,
    fontWeight: "700"
  }
});
