import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useEffect, useState, useRef } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import BrandHero from "../components/BrandHero";
import MedicalNotice from "../components/MedicalNotice";
import Input from "../components/Input";
import api, { API_ORIGIN } from "../api/client";
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
  const desktop = useDesktop();
  const scrollRef = useRef(null);
  const analysis = route.params?.analysis;
  const [addition, setAddition] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState([]);
  useEffect(() => {
    let active = true;
    setAddition(""); setError("");
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    setVersions(route.params?.caseVersions || (analysis ? [analysis] : []));
    if (analysis?._id) api.get(`/history?personId=${encodeURIComponent(analysis.monitoredPersonId || "self")}`).then(({ data }) => {
      if (!active || !Array.isArray(data)) return;
      const root = String(analysis.caseId || analysis._id);
      setVersions(data.filter(item => String(item.caseId || item._id) === root).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
    }).catch(() => {});
    return () => { active = false; };
  }, [analysis?._id]);
  async function complement() {
    if (saving) return;
    if (!addition.trim() || addition.length > 4000) { setError("Escreva a nova informação em até 4.000 caracteres."); return; }
    setSaving(true); setError("");
    try {
      const form = new FormData();
      form.append("parentAnalysisId", analysis._id);
      form.append("additionalInfo", addition.trim());
      form.append("type", "symptoms");
      const { data } = await api.post("/ai/analyze", form, { timeout: 150000 });
      if (!data.analysis?.parentAnalysisId) throw new Error("O serviço precisa ser atualizado para salvar complementos vinculados. Seu texto foi mantido.");
      const updated = [...versions, data.analysis];
      navigation.setParams({ analysis: data.analysis, caseVersions: updated, imageUri: null });
      setAddition("");
    } catch (failure) { setError(failure.response?.data?.message || failure.message || "Não foi possível atualizar. Seu texto foi mantido."); }
    finally { setSaving(false); }
  }
  if (!analysis) return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]}><View style={styles.empty}>
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
  return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, desktop && desktopContent]}>
        <BrandHero title="Sua orientação" subtitle={isLocal ? "Registro anterior · orientação local" : "Entenda o relato e os próximos passos"} onBack={() => navigation.goBack()} />
        <View style={styles.body}>
        {versions.length > 1 ? <Card><Text style={styles.sectionTitle}>Evolução deste relato</Text><Text style={styles.hint}>Cada versão preserva a orientação daquele momento.</Text><View style={styles.versions}>{versions.map((version, index) => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: version._id === analysis._id }} disabled={saving} key={version._id} onPress={() => navigation.setParams({ analysis: version, caseVersions: versions, imageUri: null })} style={[styles.version, version._id === analysis._id && styles.selectedVersion]}><Text style={[styles.versionText, version._id === analysis._id && { color: "white" }]}>{index === 0 ? "Original" : `Atualização ${index}`}</Text><Text style={[styles.hint, version._id === analysis._id && { color: "#D0EBE3" }]}>{new Date(version.createdAt).toLocaleString("pt-BR")}</Text></TouchableOpacity>)}</View></Card> : null}
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
        {questions.length ? <Section title="Para entender melhor" icon="comment-question-outline" items={questions} /> : null}
        <Card style={{ gap: 16 }}>
          <View style={styles.sectionHeading}><MaterialCommunityIcons name="message-plus-outline" size={22} color={colors.primary} /><Text style={styles.sectionTitle}>Adicionar uma informação</Text></View>
          <Text style={styles.hint}>Responda às perguntas ou conte o que mudou. A nova orientação ficará junto desta no prontuário, sem apagar a anterior. Imagens anteriores não são reavaliadas neste complemento de texto.</Text>
          <Input label="O que você quer acrescentar?" value={addition} onChangeText={setAddition} multiline placeholder="Ex.: começou ontem à noite e piora quando caminho…" />
          {error ? <Text accessibilityRole="alert" style={styles.formError}>{error}</Text> : null}
          <Button style={desktop ? { alignSelf: "flex-start" } : undefined} title="Atualizar orientação" icon="creation" loading={saving} disabled={!analysis._id} onPress={complement} />
          {saving ? <Text style={styles.hint}>Estamos analisando o complemento. Em caso de instabilidade, tentaremos novamente automaticamente. Aguarde até dois minutos.</Text> : null}
        </Card>
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
  versions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  version: { padding: 12, borderRadius: 12, backgroundColor: colors.background, gap: 4 },
  selectedVersion: { backgroundColor: colors.primary },
  versionText: { fontFamily, fontSize: 13, fontWeight: "600", color: colors.primary },
  formError: { fontFamily, color: colors.danger, lineHeight: 21, marginVertical: 10 },
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
