import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { HeaderArtwork, RecordArtwork, VitalSparkline } from "../components/HomeArtwork";
import BottomTab from "../components/BottomTab";
import ActionRow from "../components/ActionRow";
import { useAuth } from "../context/AuthContext";
import { fontFamily } from "../constants/theme";
import { demoVitals } from "../utils/demoVitals";

const metrics = [
  { title: "Glicose", icon: "water-outline", unit: "mg/dL", value: demoVitals.glucose, color: "#199D7C", darkColor: "#70DCB4" },
  { title: "Frequência", icon: "heart-pulse", unit: "bpm", value: demoVitals.heartRate, color: "#D86879", darkColor: "#F497A7", pulse: true },
  { title: "Pressão", icon: "gauge", unit: "mmHg", value: demoVitals.bloodPressure, color: "#388FB9", darkColor: "#79C3EB" },
  { title: "Atividade", icon: "shoe-print", unit: "passos", value: demoVitals.steps, color: "#23A78A", darkColor: "#77DFC4", bars: true }
];

export default function HomeScreen({ navigation }) {
  const { colors, styles, isDark } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "bem-vindo";
  const date = new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, desktop && desktopContent]}>
        <LinearGradient colors={isDark ? ["#112D30", "#074C40"] : ["#F5FCFA", "#DAF5EC"]} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.homeHero, desktop && {borderRadius:28}]}>
          <HeaderArtwork dark={isDark} />
          <View style={styles.brandRow}><View style={styles.brand}><LinearGradient colors={["#15B497", "#076457"]} style={styles.brandMark}><MaterialCommunityIcons name="pulse" size={23} color="white"/></LinearGradient><Text style={styles.brandName}>MEDSCAN</Text></View><TouchableOpacity accessibilityRole="button" accessibilityLabel="Notificações" onPress={()=>navigation.navigate("Notifications")} style={styles.bell}><MaterialCommunityIcons name="bell-outline" size={23} color={colors.primary}/></TouchableOpacity></View>
          <Text style={styles.greeting}>{`Olá, ${firstName}`}</Text><Text style={styles.subtitle}>Seu cuidado em um só lugar</Text>
          <View style={styles.healthBadge}><View style={styles.healthDot}/><Text style={styles.healthText}>Seu espaço de saúde</Text></View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Visão geral</Text><Text style={styles.link}>Hoje, {date}</Text></View>
          <View style={desktop && styles.dashboardRow}>
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("History")} activeOpacity={0.9} style={[styles.recordCard, desktop && { flex: 1 }]}>
            <LinearGradient colors={isDark ? ["#064C40", "#092C2B"] : ["#07584F", "#09937B"]} start={{x:0,y:0}} end={{x:1,y:1}} style={StyleSheet.absoluteFillObject}/>
            <View pointerEvents="none" style={styles.cardHalo} />
            <Text style={styles.eyebrow}>PRONTUÁRIO INTELIGENTE</Text>
            <Text style={styles.cardTitle}>Seu histórico, mais claro.</Text>
            <Text style={styles.cardCopy}>Relatos e exames organizados para acompanhar sua evolução.</Text>
            <View style={styles.recordArt}><RecordArtwork/></View>
            <View style={styles.cta}><Text style={styles.ctaText}>Ver prontuário</Text><MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.onCta} /></View>
          </TouchableOpacity>
          {desktop ? <View style={styles.desktopQuick}><Text style={styles.sectionTitle}>Como podemos ajudar?</Text><Text style={styles.metricNote}>Escolha por onde começar seu cuidado.</Text><ActionRow title="Conversar com a IA" subtitle="Conte o que está sentindo" icon="creation" onPress={() => navigation.navigate("Analyze", { type: "symptoms" })} /><ActionRow title="Adicionar exame" subtitle="Organize um novo documento" icon="file-plus-outline" color={colors.info} onPress={() => navigation.navigate("Analyze", { type: "exam" })} /></View> : null}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Sinais vitais</Text>
            <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("Monitoring")}><Text style={styles.link}>Ver monitoramento</Text></TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {metrics.map(metric => {
              const accent = isDark ? metric.darkColor : metric.color;
              return (
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${metric.title}: ${metric.value} ${metric.unit}, demonstração. Abrir monitoramento`} key={metric.title} style={[styles.metric, desktop && { width: "23%" }]} onPress={() => navigation.navigate("Monitoring")}>
                <View style={styles.metricHeader}><View style={[styles.metricIcon,{backgroundColor:`${accent}18`}]}><MaterialCommunityIcons name={metric.icon} size={20} color={accent} /></View><Text style={styles.metricLabel}>{metric.title}</Text></View>
                <View style={styles.metricReading}><Text style={styles.metricValue}>{metric.value}</Text></View>
                <VitalSparkline color={accent} bars={metric.bars} pulse={metric.pulse}/>
                <Text style={styles.metricUnit}>{metric.unit} · demonstração</Text>
              </TouchableOpacity>
            );})}
          </View>
          <View style={styles.demoNote}><MaterialCommunityIcons name="information-outline" size={16} color={colors.textMuted}/><Text style={[styles.metricNote,{flex:1,marginTop:0}]}>Valores e gráficos demonstrativos, sem leitura de dispositivos.</Text></View>

          {!desktop ? <>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.actions}>
            <ActionRow title="Conversar com a IA" subtitle="Entenda seus sintomas com mais contexto" icon="creation" onPress={() => navigation.navigate("Analyze", { type: "symptoms" })} />
            <ActionRow title="Adicionar exame" subtitle="Envie uma imagem do seu documento" icon="file-plus-outline" color={colors.info} onPress={() => navigation.navigate("Analyze", { type: "exam" })} />
          </View>
          </> : null}
          <View style={styles.footer}><MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textMuted} /><Text style={styles.footerText}>Informação para cuidar melhor de você.</Text></View>
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  homeHero: { padding:24, paddingBottom:28, borderBottomLeftRadius:32, borderBottomRightRadius:32, overflow:"hidden" },
  brandRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:27 },
  brand: { flexDirection:"row", alignItems:"center", gap:10 },
  brandMark: { width:40, height:40, borderRadius:13, alignItems:"center", justifyContent:"center" },
  brandName: { fontFamily, color:colors.primary, fontSize:17, fontWeight:"700", letterSpacing:-.5 },
  bell: { width:42, height:42, borderRadius:16, backgroundColor:colors.surface, alignItems:"center", justifyContent:"center" },
  greeting: { fontFamily, fontSize:29, fontWeight:"700", letterSpacing:-1, color:colors.text },
  subtitle: { fontFamily, color:colors.textMuted, fontSize:14, marginTop:6 },
  healthBadge: { flexDirection:"row", gap:7, alignItems:"center", alignSelf:"flex-start", backgroundColor:colors.primaryLight, paddingVertical:8, paddingHorizontal:12, borderRadius:20, marginTop:20 },
  healthDot: { width:7, height:7, borderRadius:4, backgroundColor:colors.primaryMedium },
  healthText: { fontFamily, fontSize:12, color:colors.primary, fontWeight:"500" },
  recordArt: { position:"absolute", right:-12, bottom:0 },
  metricReading: { flexDirection:"row", alignItems:"center" },
  demoNote: { flexDirection:"row", gap:7, alignItems:"flex-start" },
  dashboardRow: { flexDirection: "row", gap: 24, alignItems: "stretch" },
  desktopQuick: { flex: 1, gap: 14, padding: 22, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 110 },
  body: { padding: 20, gap: 17 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5, gap: 8 },
  sectionTitle: { color: colors.text, fontFamily, fontSize: 16, fontWeight: "700", letterSpacing: -0.3 },
  link: { color: colors.primary, fontFamily, fontSize: 11, fontWeight: "600", paddingVertical: 8 },
  recordCard: { backgroundColor: colors.hero, borderWidth: 1, borderColor: colors.heroHalo, borderRadius: 24, padding: 21, minHeight:238, overflow: "hidden", shadowColor: "#064D40", shadowOpacity: 0.15, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  cardHalo: { position: "absolute", right: -45, bottom: -90, width: 200, height: 200, borderRadius: 100, borderWidth: 24, borderColor: "#ffffff08", backgroundColor: "#ffffff04" },
  eyebrow: { color: "#C1F0E4", fontFamily, fontSize: 10, fontWeight: "700", letterSpacing: 1.3 },
  cardTitle: { color: "white", fontFamily, fontSize: 23, fontWeight: "700", marginTop: 14, letterSpacing: -0.6, paddingRight:70 },
  cardCopy: { color: "#DBF7EF", fontFamily, fontSize: 13, lineHeight: 20, marginTop: 9, paddingRight:95 },
  cta: { alignSelf: "flex-start", backgroundColor: colors.cta, flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, marginTop: 18 },
  ctaText: { color: colors.onCta, fontFamily, fontSize: 12, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  metric: { width: "48%", flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 20, padding: 14, shadowColor:"#075E52", shadowOpacity:.035, shadowRadius:12, shadowOffset:{width:0,height:5}, elevation:1 },
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
