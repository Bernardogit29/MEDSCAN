import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandHero from "./BrandHero";
import { colors } from "../constants/theme";

export default function AuthLayout({ title, subtitle, navigation, children }) {
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" && width >= 1000;
  return <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={[styles.content, desktop && styles.desktopContent]} keyboardShouldPersistTaps="handled">
        <View style={[styles.layout, desktop && styles.desktopLayout]}>
          <BrandHero desktop={desktop} title={title} subtitle={subtitle} badge="Seu cuidado em um só lugar" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
          <View style={[styles.body, desktop && styles.desktopBody]}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 32 },
  layout: { width: "100%" },
  desktopContent: { maxWidth: 1200, flexGrow: 1, justifyContent: "center", padding: 40 },
  desktopLayout: { flexDirection: "row", alignItems: "center", gap: 40 },
  desktopBody: { flex: 1, minWidth: 0, margin: 0, padding: 32, gap: 22 },
  body: { margin: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 24 }
});
