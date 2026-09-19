import React from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import BrandHero from "../components/BrandHero";
import MedicalNotice from "../components/MedicalNotice";
import { API_ORIGIN } from "../api/client";
import { fontFamily, colors } from "../constants/theme";

function Section({ title, icon, text, items, alert }) {
  if (!text && !items?.length) return null;
  return (
    <Card style={alert ? styles.alertCard : undefined}>
      <View style={styles.sectionHeading}>
        <MaterialCommunityIcons name={icon} size={20} color={alert ? "#AC5726" : colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {text ? <Text selectable style={styles.copy}>{text}</Text> : null}
      {items?.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <View style={[styles.number, alert && styles.alertNumber]}><Text style={styles.numberText}>{index + 1}</Text></View>
          <Text selectable style={styles.listCopy}>{typeof item === "string" ? item : [item.label, item.text].filter(Boolean).join(": ")}</Text>
        </View>
      ))}
    </Card>
  );
}

export default function ResultScreen({ navigation, route }) {
  const analysis = route.params?.analysis;
  if (!analysis) return (
    <SafeAreaView style={styles.safe}><View style={styles.empty}>
      <Header title="Nenhuma análise selecionada" showBell={false} />
      <Button title="Descrever sintomas" onPress={() => navigation.navigate("Analyze")} />
    </View></SafeAreaView>
  );
  const result = analysis.result || analysis;
  const report = result.report || {};
  const source = result.source || "";
  const isLocal = source.startsWith("local-fallback") || String(analysis._id || "").startsWith("mock");
  const risk = analysis.riskLevel || result.riskLevel || "Indeterminado";
  const urgent = !isLocal && risk === "Alto";
  const imageUri = route.params?.imageUri || (analysis.imageUrl ? (analysis.imageUrl.startsWith("http") ? analysis.imageUrl : `${API_ORIGIN}${analysis.imageUrl}`) : null);
  const questions = report.questionsForClinician || [];
  function complement() {
    const initialSymptoms = [analysis.symptoms, "Informações complementares:", ...questions.map(question => `${question}\nResposta: `)].filter(Boolean).join("\n\n");
    navigation.push("Analyze", { initialSymptoms, type: "symptoms", monitoredPersonId: analysis.monitoredPersonId || "self", revision: Date.now() });
  }
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <BrandHero title="Sua orientação" subtitle={isLocal ? "Registro anterior · orientação local" : "Entenda o relato e os próximos passos"} onBack={() => navigation.goBack()} />
        <View style={styles.body}>
        {isLocal ? <Text style={styles.legacy}>Este registro foi gerado por regras locais ou demonstração, sem análise do Gemini. Faça uma nova análise para obter uma orientação atualizada.</Text> : null}
        <View style={[styles.overview, urgent && styles.urgent]}>
          <View style={styles.overviewTop}><MaterialCommunityIcons name={urgent ? "alert-circle-outline" : "creation"} size={22} color="white" /><Text style={styles.eyebrow}>{urgent ? "ATENÇÃO AO PRÓXIMO PASSO" : "LEITURA DO SEU RELATO"}</Text></View>
          <Text style={styles.title}>{analysis.possibleCondition || result.possibleCondition || "Orientação de saúde"}</Text>
          {!isLocal ? <Text style={styles.risk}>Prioridade orientativa: {risk.toLowerCase()}</Text> : null}
          <Text selectable style={styles.overviewCopy}>{analysis.recommendation || result.recommendation || report.summary}</Text>
          <Text style={styles.limit}>Orientação informativa, sem confirmação de diagnóstico.</Text>
        </View>
        {analysis.symptoms ? <Section title="O que você contou" icon="message-text-outline" text={analysis.symptoms} /> : null}
        {imageUri ? <Image accessibilityLabel="Imagem enviada para análise" source={{ uri: imageUri }} style={styles.image} resizeMode="contain" /> : null}
        <Section title="Entendendo o seu relato" icon="text-box-outline" text={report.summary} />
        <Section title="O que isso pode significar" icon="lightbulb-outline" text={result.details || analysis.details} />
        <Section title="Pontos relevantes" icon="clipboard-check-outline" items={report.relevantFindings} />
        <Section title="Possíveis explicações" icon="magnify" items={report.possibleExplanations} />
        <Section title="Observações da imagem" icon="image-outline" text={result.visualFindings} />
        <Section title="O que fazer agora" icon="check-circle-outline" items={report.nextSteps} />
        <Section title="Sinais de alerta" icon="alert-outline" items={report.redFlags} alert />
        <Section title="Quando buscar atendimento" icon="hospital-building" text={report.whenToSeekCare} />
        {questions.length ? <>
          <Section title="Para entender melhor" icon="comment-question-outline" items={questions} />
          <Text style={styles.hint}>Você pode responder às perguntas e gerar uma nova análise com o relato anterior. Se precisar avaliar a imagem novamente, anexe-a de novo.</Text>
          <Button title="Complementar meu relato" icon="message-plus-outline" onPress={complement} />
        </> : <Button title="Fazer nova análise" onPress={() => navigation.navigate("Analyze")} />}
        <Section title="Limites desta orientação" icon="information-outline" text={report.limitations} />
        <Button title="Buscar atendimento no mapa" icon="map-marker-outline" variant="outline" onPress={() => Linking.openURL("https://www.google.com/maps/search/hospitais+perto+de+mim")} />
        <MedicalNotice />
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: 20, gap: 16 },
  content: { paddingBottom: 130, width: "100%", maxWidth: 720, alignSelf: "center" },
  empty: { padding: 24, gap: 16 },
  overview: { backgroundColor: colors.primary, borderRadius: 26, padding: 23, gap: 13 },
  urgent: { backgroundColor: "#963F31" },
  overviewTop: { flexDirection: "row", alignItems: "center", gap: 9 },
  eyebrow: { color: "#E2F2EB", fontFamily, fontSize: 10, fontWeight: "700", letterSpacing: 1.2, flex: 1 },
  title: { color: "white", fontFamily, fontSize: 24, lineHeight: 31, fontWeight: "700", letterSpacing: -0.6 },
  risk: { color: "white", fontFamily, fontSize: 12, fontWeight: "600" },
  overviewCopy: { color: "white", fontFamily, fontSize: 15, lineHeight: 24 },
  limit: { color: "#E2F2EB", fontFamily, fontSize: 11, lineHeight: 17, marginTop: 2 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 13 },
  sectionTitle: { color: colors.text, fontWeight: "700", fontFamily, fontSize: 16, flex: 1 },
  copy: { color: colors.text, fontFamily, fontSize: 15, lineHeight: 25 },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  listCopy: { color: colors.text, fontFamily, fontSize: 14, lineHeight: 23, flex: 1 },
  number: { width: 23, height: 23, borderRadius: 8, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  numberText: { color: colors.primary, fontFamily, fontSize: 11, fontWeight: "700" },
  alertCard: { backgroundColor: "#FFFAF1", borderColor: "#F0DFBF" },
  alertNumber: { backgroundColor: "#F8E8CA" },
  hint: { fontFamily, fontSize: 12, lineHeight: 20, color: colors.textMuted },
  legacy: { color: "#88552C", backgroundColor: "#FFF5DF", borderRadius: 16, padding: 16, lineHeight: 22 },
  image: { width: "100%", height: 220, backgroundColor: colors.white, borderRadius: 18 }
});
