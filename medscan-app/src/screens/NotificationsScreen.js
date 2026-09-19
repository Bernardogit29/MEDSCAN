import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import BrandHero from "../components/BrandHero";
import { fontFamily, colors, radius, shadows } from "../constants/theme";
import { mockNotifications } from "../utils/mockData";

function iconForType(type) {
  if (type === "alert") return "alert-outline";
  if (type === "device") return "devices";
  if (type === "recommendation") return "hospital-building";
  if (type === "reminder") return "clock-outline";
  return "file-check-outline";
}

function colorForType(type) {
  if (type === "alert") return colors.warning;
  if (type === "recommendation") return colors.danger;
  if (type === "device") return colors.info;
  return colors.primary;
}

export default function NotificationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <BrandHero
          title="Notificações"
          subtitle="Alertas, lembretes e atualizacoes recentes"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.body}>

        <View style={styles.list}>
          {mockNotifications.map((notification) => {
            const itemColor = colorForType(notification.type);

            return (
              <TouchableOpacity key={notification._id} style={styles.item} activeOpacity={0.86}>
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
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Profile" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
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
