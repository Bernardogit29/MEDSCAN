import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BrandHero from "../components/BrandHero";
import BottomTab from "../components/BottomTab";
import ActionRow from "../components/ActionRow";
import { useAuth } from "../context/AuthContext";
import { fontFamily, colors } from "../constants/theme";

const metrics = [
  { title: "Glicose", icon: "water-outline", unit: "mg/dL" },
  { title: "Frequência", icon: "heart-pulse", unit: "bpm" },
  { title: "Pressão", icon: "gauge", unit: "mmHg" },
  { title: "Atividade", icon: "shoe-print", unit: "passos" }
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "bem-vindo";
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandHero title={`Olá, ${firstName}`} subtitle="Seu cuidado em um só lugar" badge="Seu espaço de saúde" onNotifications={() => navigation.navigate("Notifications")} />

        <View style={styles.body}>
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Visão geral</Text><Text style={styles.link}>Hoje, {date}</Text></View>
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("History")} activeOpacity={0.9} style={styles.recordCard}>
            <View pointerEvents="none" style={styles.cardHalo} />
            <Text style={styles.eyebrow}>PRONTUÁRIO INTELIGENTE</Text>
            <Text style={styles.cardTitle}>Seu histórico, mais claro.</Text>
            <Text style={styles.cardCopy}>Suas análises e exames organizados{`\n`}para acompanhar sua evolução.</Text>
            <View style={styles.cta}><Text style={styles.ctaText}>Ver prontuário</Text><MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.primary} /></View>
          </TouchableOpacity>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Sinais vitais</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("Monitoring")}><Text style={styles.link}>Ver monitoramento</Text></TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {metrics.map(metric => (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${metric.title}: sem medição. Abrir monitoramento`} key={metric.title} style={styles.metric} onPress={() => navigation.navigate("Monitoring")}>
                <View style={styles.metricHeader}><View style={styles.metricIcon}><MaterialCommunityIcons name={metric.icon} size={18} color={colors.primary} /></View><Text style={styles.metricLabel}>{metric.title}</Text></View>
                <Text style={styles.metricValue}>—</Text>
                <Text style={styles.metricUnit}>{metric.unit} · sem medição</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.metricNote}>Suas medições aparecerão quando houver dados conectados.</Text>

          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.actions}>
            <ActionRow title="Conversar com a IA" subtitle="Entenda seus sintomas com mais contexto" icon="creation" onPress={() => navigation.navigate("Analyze", { type: "symptoms" })} />
            <ActionRow title="Adicionar exame" subtitle="Envie uma imagem do seu documento" icon="file-plus-outline" onPress={() => navigation.navigate("Analyze", { type: "exam" })} />
          </View>
          <View style={styles.footer}><MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textMuted} /><Text style={styles.footerText}>Informação para cuidar melhor de você.</Text></View>
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 110 },
  body: { padding: 20, gap: 17 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, gap: 8 },
  sectionTitle: { color: colors.text, fontFamily, fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
  link: { color: colors.primary, fontFamily, fontSize: 11, fontWeight: "600", paddingVertical: 8 },
  recordCard: { backgroundColor: colors.primary, borderRadius: 24, padding: 21, overflow: "hidden", shadowColor: colors.primary, shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  cardHalo: { position: "absolute", right: -45, bottom: -90, width: 200, height: 200, borderRadius: 100, borderWidth: 24, borderColor: "#ffffff08", backgroundColor: "#ffffff04" },
  eyebrow: { color: "#C1F0E4", fontFamily, fontSize: 10, fontWeight: "700", letterSpacing: 1.3 },
  cardTitle: { color: "white", fontFamily, fontSize: 21, fontWeight: "700", marginTop: 14, letterSpacing: -0.6 },
  cardCopy: { color: "#DBF7EF", fontFamily, fontSize: 13, lineHeight: 20, marginTop: 7 },
  cta: { alignSelf: "flex-start", backgroundColor: "#DDFFF2", flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginTop: 18 },
  ctaText: { color: colors.primary, fontFamily, fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  metric: { width: "48%", flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 15 },
  metricHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  metricIcon: { width: 27, height: 27, borderRadius: 8, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  metricLabel: { color: colors.textMuted, fontFamily, fontSize: 12 },
  metricValue: { color: colors.text, fontFamily, fontSize: 25, fontWeight: "700", marginTop: 11 },
  metricUnit: { color: colors.textMuted, fontFamily, fontSize: 10, marginTop: 3 },
  metricNote: { color: colors.textMuted, fontFamily, fontSize: 11, lineHeight: 17, marginTop: -7 },
  actions: { gap: 10 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 },
  footerText: { color: colors.textMuted, fontFamily, fontSize: 11 }
});
