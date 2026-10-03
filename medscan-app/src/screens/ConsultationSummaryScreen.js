import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import { fontFamily } from "../constants/theme";
import api from "../api/client";
import Header from "../components/Header";
import Button from "../components/Button";
import Card from "../components/Card";
import BottomTab from "../components/BottomTab";
import { consultationSummary, summaryHtml } from "../utils/consultationSummary";
import { printSummary } from "../utils/printSummary";

export default function ConsultationSummaryScreen({ route, navigation }) {
  const { colors, styles } = useAppTheme(createStyles);
  const { user, token } = useAuth();
  const desktop = useDesktop();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [revision, setRevision] = useState(0);
  const analysisId = route.params?.analysisId;
  const personId = route.params?.personId || "self";
  useEffect(() => {
    let active = true;
    setSummary(null); setError(""); setLoading(true);
    async function load() {
      try {
        if (!analysisId || !user || !token) throw new Error("Abra um relato do prontuário para preparar seu resumo.");
        const results = await Promise.allSettled([api.get(`/history?personId=${encodeURIComponent(personId)}`), api.get(`/monitoring/history?personId=${encodeURIComponent(personId)}`)]);
        if (results.some(result => result.status === "rejected")) throw new Error("Não foi possível carregar o relato e as medições. Tente novamente para gerar um resumo completo.");
        const history = results[0].value.data, monitoring = results[1].value.data;
        if (!Array.isArray(history) || !Array.isArray(monitoring.records)) throw new Error("Não foi possível conferir os registros recebidos.");
        const analysis = history.find(item => String(item._id) === String(analysisId) && (item.monitoredPersonId || "self") === personId);
        if (!analysis) throw new Error("Este relato não está disponível no prontuário desta pessoa.");
        if (active) setSummary(consultationSummary(analysis, history, monitoring.records, personId === "self" ? user.name : analysis.monitoredPersonName));
      } catch (failure) { if (active) setError(failure.message); }
      finally { if (active) setLoading(false); }
    }
    load(); return () => { active = false; };
  }, [analysisId, personId, user, token, revision]);
  async function exportSummary() {
    if (printing || !summary) return;
    setPrinting(true); setError("");
    try { await printSummary(summaryHtml(summary)); }
    catch (failure) { setError(failure.message || "Não foi possível abrir a exportação. Tente novamente."); }
    finally { setPrinting(false); }
  }
  return <SafeAreaView style={[styles.safe, desktop && desktopPage]}><ScrollView contentContainerStyle={[styles.content, desktop && desktopContent]}>
    <Header title="Resumo para consulta" subtitle="Seu relato organizado para conversar com um profissional." onBack={() => navigation.goBack()} showBell={false} />
    {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando resumo" /> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {!loading && !summary ? <Button title="Tentar novamente" onPress={() => setRevision(value => value + 1)} /> : null}
    {summary ? <>
      <Card><Text style={styles.heading}>{summary.person}</Text><Text style={styles.note}>Gerado em {summary.generatedAt} · {summary.timezone}</Text><Text style={styles.note}>Revise antes de compartilhar. Este documento contém informações pessoais de saúde.</Text></Card>
      <Button title={Platform.OS === "web" ? "Imprimir ou salvar em PDF" : "Salvar ou compartilhar PDF"} icon="file-pdf-box" onPress={exportSummary} loading={printing} />
      {Platform.OS === "web" ? <Text style={styles.note}>Na janela de impressão, escolha “Salvar como PDF” para guardar o arquivo.</Text> : null}
      {summary.sections.map(section => <Card key={section.title}><Text style={styles.heading}>{section.title}</Text><Text style={styles.note}>{section.note}</Text>{section.entries.length ? section.entries.map((entry, index) => <View key={index} style={styles.entry}><Text style={styles.label}>{entry.title}</Text><Text selectable style={styles.copy}>{entry.body}</Text></View>) : <Text style={styles.copy}>Nenhuma medição registrada disponível.</Text>}</Card>)}
    </> : null}
  </ScrollView><BottomTab navigation={navigation} active="History" /></SafeAreaView>;
}
const createStyles = colors => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, content: { padding: 20, paddingBottom: 130, gap: 16, width: "100%", maxWidth: 900, alignSelf: "center" },
  heading: { fontFamily, fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 10 }, note: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.textMuted, marginBottom: 8 },
  label: { fontFamily, fontSize: 14, color: colors.primary, fontWeight: "700", marginBottom: 9 }, copy: { fontFamily, color: colors.text, fontSize: 15, lineHeight: 24 },
  entry: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 16, marginTop: 16 }, error: { color: colors.danger, lineHeight: 22 }
});
