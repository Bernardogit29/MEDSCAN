import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BrandHero from "./BrandHero";
import { colors } from "../constants/theme";

export default function AuthLayout({ title, subtitle, navigation, children }) {
  return <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BrandHero title={title} subtitle={subtitle} badge="Seu cuidado em um só lugar" onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined} />
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 32 },
  body: { margin: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, gap: 24 }
});
