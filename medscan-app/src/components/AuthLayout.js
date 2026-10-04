import React from "react";
import { ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { fontFamily } from "../constants/theme";
import { authColors } from "../constants/authTheme";

const medicalBackground = require("../../assets/auth-medical.png");

export default function AuthLayout({ title, accent, subtitle, eyebrow = "BEM-VINDO DE VOLTA", welcome = false, navigation, children }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  return <View style={styles.screen}>
    <ImageBackground source={medicalBackground} resizeMode="cover" imageStyle={styles.backgroundImage} style={StyleSheet.absoluteFill} accessible={false}>
      <LinearGradient
        colors={desktop ? ["rgba(4,22,25,0.97)", "rgba(4,22,25,0.88)", "rgba(4,22,25,0.25)", "rgba(4,22,25,0.08)"] : ["rgba(4,22,25,0.62)", "rgba(4,22,25,0.82)", "rgba(4,22,25,0.92)"]}
        locations={desktop ? [0, 0.32, 0.7, 1] : [0, 0.48, 1]}
        start={{ x: 0, y: 0 }} end={desktop ? { x: 1, y: 0 } : { x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {desktop && <LinearGradient colors={["transparent", "rgba(4,22,25,0.72)"]} start={{ x: 0, y: 0.5 }} style={StyleSheet.absoluteFill} />}
    </ImageBackground>
    <SafeAreaView style={styles.safe} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.safe} contentContainerStyle={[styles.content, desktop && styles.desktopContent]} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
          <View style={styles.navigation}>
            <View style={styles.brand}>
              <MaterialCommunityIcons name="pulse" size={30} color={authColors.primary} />
              <Text style={styles.brandName}>medscan<Text style={styles.brandDot}>.</Text></Text>
            </View>
            <Pressable accessibilityRole="button"
              accessibilityLabel={welcome ? "Entrar na minha conta" : "Voltar ao início"}
              onPress={() => navigation.navigate(welcome ? "Login" : "Welcome")}
              style={({ hovered, pressed }) => [styles.navLink, (hovered || pressed) && styles.activeLink]}>
              <Text style={styles.navLabel}>{welcome ? "Entrar" : "Início"}</Text>
              <MaterialCommunityIcons name={welcome ? "arrow-top-right" : "arrow-left"} size={18} color={authColors.text} />
            </Pressable>
          </View>
          <View style={[styles.main, desktop && styles.desktopMain]}>
            <View style={[styles.form, desktop && styles.desktopForm, welcome && styles.welcomeForm]}>
              <View style={styles.heading}>
                <View style={styles.eyebrowRow}><View style={styles.eyebrowLine} /><Text style={styles.eyebrow}>{eyebrow}</Text></View>
                <Text accessibilityRole="header" style={[styles.title, desktop && styles.desktopTitle, welcome && styles.welcomeTitle, desktop && welcome && styles.desktopWelcomeTitle]}>
                  {title}{accent ? <Text style={styles.accent}>{accent}</Text> : null}
                </Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              {children}
            </View>
            {desktop && <View style={styles.caption}>
              <View style={styles.captionRule} />
              <Text style={styles.captionEyebrow}>CUIDADO CONECTADO</Text>
              <Text style={styles.captionTitle}>Mais sobre sua saúde.{"\n"}Mais perto de você.</Text>
              <View style={styles.captionBottom}><MaterialCommunityIcons name="heart-pulse" color={authColors.primary} size={20} /><Text style={styles.captionSmall}>Clareza para o seu próximo passo.</Text></View>
            </View>}
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>SAÚDE, COM UM NOVO OLHAR.</Text>
            {desktop && <Text style={styles.footerText}>MEDSCAN · SEU ESPAÇO DE CUIDADO</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#061C1F" },
  safe: { flex: 1 },
  backgroundImage: { width: "100%", height: "100%" },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 22, paddingBottom: 24 },
  desktopContent: { paddingHorizontal: "7%", paddingTop: 36, paddingBottom: 28 },
  navigation: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 16 },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  brandName: { fontFamily, fontSize: 27, lineHeight: 34, fontWeight: "700", letterSpacing: -1.2, color: authColors.text },
  brandDot: { color: authColors.primary },
  navLink: { minHeight: 44, paddingHorizontal: 12, gap: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(4,22,25,0.48)", borderBottomWidth: 1, borderBottomColor: authColors.border },
  activeLink: { borderBottomColor: authColors.primary, opacity: 0.8 },
  navLabel: { fontFamily, fontSize: 13, color: authColors.text, fontWeight: "600" },
  main: { flexGrow: 1, justifyContent: "center", paddingVertical: 48 },
  desktopMain: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 60, paddingVertical: 48 },
  form: { width: "100%", maxWidth: 520, alignSelf: "center", gap: 28 },
  desktopForm: { width: "46%", maxWidth: 460, alignSelf: "center" },
  welcomeForm: { maxWidth: 600 },
  heading: { gap: 18 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  eyebrowLine: { width: 26, height: 1, backgroundColor: authColors.primary },
  eyebrow: { fontFamily, fontSize: 10, lineHeight: 16, letterSpacing: 2, fontWeight: "600", color: authColors.primary, flexShrink: 1 },
  title: { fontFamily, fontSize: 38, lineHeight: 42, letterSpacing: -1.5, fontWeight: "500", color: authColors.text },
  desktopTitle: { fontSize: 48, lineHeight: 53, letterSpacing: -2 },
  welcomeTitle: { fontSize: 44, lineHeight: 48 },
  desktopWelcomeTitle: { fontSize: 68, lineHeight: 72, letterSpacing: -3 },
  accent: { color: authColors.primary, fontWeight: "700" },
  subtitle: { fontFamily, fontSize: 14, lineHeight: 24, color: authColors.textMuted, maxWidth: 400 },
  caption: { alignSelf: "flex-end", width: "34%", maxWidth: 360, paddingBottom: 26, gap: 20 },
  captionRule: { width: 44, height: 2, backgroundColor: authColors.primary },
  captionEyebrow: { fontFamily, fontSize: 10, letterSpacing: 2, fontWeight: "600", color: authColors.primary },
  captionTitle: { fontFamily, fontSize: 28, lineHeight: 36, letterSpacing: -0.6, fontWeight: "500", color: authColors.text },
  captionBottom: { flexDirection: "row", alignItems: "center", gap: 10 },
  captionSmall: { fontFamily, fontSize: 12, lineHeight: 20, color: authColors.textMuted, flexShrink: 1 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderTopWidth: 1, borderTopColor: "rgba(211,242,232,0.16)", paddingTop: 20 },
  footerText: { fontFamily, fontSize: 8, lineHeight: 14, fontWeight: "500", letterSpacing: 1.7, color: authColors.textMuted }
});
