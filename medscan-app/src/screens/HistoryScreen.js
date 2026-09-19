import React, { useCallback, useState } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, fontFamily } from "../constants/theme";
import { getMonitoredPeople, MONITORED_PERSON_STORAGE_KEY } from "../utils/monitoredPeople";
import { setStoredItem } from "../utils/storage";

function dateTime(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Horário não informado";
}
function Row({ icon, title, subtitle, onPress, expanded }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={onPress} style={styles.row}>
    <View style={styles.icon}><MaterialCommunityIcons name={icon} size={23} color={colors.primary} /></View>
    <View style={styles.copy}><Text style={styles.rowTitle}>{title}</Text><Text style={styles.muted}>{subtitle}</Text></View>
    <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-right"} size={22} color={colors.textMuted} />
  </TouchableOpacity>;
}

export default function HistoryScreen({ navigation }) {
  const { user, token } = useAuth();
  const [people, setPeople] = useState(() => getMonitoredPeople(user));
  const [personId, setPersonId] = useState("self");
  const [history, setHistory] = useState([]);
  const [preferences, setPreferences] = useState({ hideHealthPreviews: true });
  const [monitoring, setMonitoring] = useState({ records: [], events: [] });
  const [loading, setLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [monitoringError, setMonitoringError] = useState("");
  const [expanded, setExpanded] = useState("events");
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(false);
  const [heartRate, setHeartRate] = useState("");
  const [glucose, setGlucose] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const selectedPerson = people.find(person => person.id === personId);

  useFocusEffect(useCallback(() => {
    let active = true;
    setPreferences({ hideHealthPreviews: true }); setHistory([]); setMonitoring({ records: [], events: [] }); setHistoryError(""); setMonitoringError("");
    if (!user || !token) { setLoading(false); return; }
    setLoading(true);
    async function load() {
      const results = await Promise.allSettled([api.get("/profile"), api.get(`/history?personId=${encodeURIComponent(personId)}`), api.get(`/monitoring/history?personId=${encodeURIComponent(personId)}`)]);
      if (!active) return;
      const [profile, analyses, measurements] = results;
      if (profile.status === "fulfilled") {
        const loaded = getMonitoredPeople(profile.value.data.user || user, profile.value.data.profile?.relatives || []);
        setPeople(loaded);
        setPreferences(profile.value.data.profile?.settings?.appPreferences || {});
        if (!loaded.some(person => person.id === personId)) { setPersonId("self"); return; }
      }
      if (analyses.status === "fulfilled") setHistory(Array.isArray(analyses.value.data) ? analyses.value.data : []);
      else setHistoryError("Não foi possível carregar as análises. Tente atualizar.");
      if (measurements.status === "fulfilled" && Array.isArray(measurements.value.data.records) && Array.isArray(measurements.value.data.events)) setMonitoring(measurements.value.data);
      else setMonitoringError("Os registros de monitoramento estão indisponíveis neste momento.");
      setLoading(false);
    }
    load(); return () => { active = false; };
  }, [user, token, personId, revision]));

  async function selectPerson(id) { setHistory([]); setMonitoring({ records: [], events: [] }); setPersonId(id); await setStoredItem(MONITORED_PERSON_STORAGE_KEY, id); }
  function toggle(id) { setExpanded(current => current === id ? "" : id); }
  async function saveMeasurement() {
    if (saving || loading || monitoringError) return;
    const values = {};
    for (const [key, raw] of [["heartRate",heartRate],["glucose",glucose]]) {
      if (!raw.trim()) continue;
      const value = Number(raw.replace(",", "."));
      if (!Number.isFinite(value) || value <= 0) { setSaveError("Informe valores numéricos positivos."); return; }
      values[key] = value;
    }
    if (!Object.keys(values).length) { setSaveError("Preencha pelo menos uma medição."); return; }
    setSaving(true); setSaveError("");
    try {
      await api.post("/monitoring", { ...values, monitoredPersonId: personId, measuredAt: new Date().toISOString(), note });
      setModal(false); setHeartRate(""); setGlucose(""); setNote(""); setRevision(value => value + 1); setExpanded("records");
    } catch (_error) { setSaveError("Não foi possível salvar a medição. Tente novamente."); }
    finally { setSaving(false); }
  }
  function analysisList(type) {
    const items = history.filter(item => type === "symptoms" ? item.type === "symptoms" : item.type !== "symptoms")
      .sort((a, b) => (new Date(b.createdAt) - new Date(a.createdAt)) * (preferences.oldestFirst ? -1 : 1));
    return <View style={styles.analysisList}>
      {historyError ? <Text style={styles.muted}>{historyError}</Text> : !items.length ? <Text style={styles.muted}>{loading ? "Carregando registros…" : "Nenhum registro nesta categoria."}</Text> : <>
        <Text style={styles.listCaption}>{items.length} {items.length === 1 ? "registro" : "registros"} · {preferences.oldestFirst ? "mais antigos primeiro" : "mais recentes primeiro"}</Text>
        {items.map(item => <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Abrir ${type === "symptoms" ? "orientação" : "análise"} de ${dateTime(item.createdAt)}`} key={item._id} style={[styles.analysisCard, preferences.compactHistory && styles.compactCard]} onPress={() => navigation.navigate("Result", { analysis: item })}>
          <View style={styles.analysisMeta}><View style={styles.analysisBadge}><MaterialCommunityIcons name={type === "symptoms" ? "message-text-outline" : "file-document-outline"} size={14} color={colors.primary} /><Text style={styles.analysisKind}>{type === "symptoms" ? "ORIENTAÇÃO" : "ANÁLISE"}</Text></View><Text style={styles.analysisDate}>{dateTime(item.createdAt)}</Text></View>
          <View style={styles.analysisHeading}><Text style={styles.analysisTitle} numberOfLines={preferences.compactHistory ? 1 : 2}>{preferences.hideHealthPreviews ? "Prévia de saúde oculta" : item.possibleCondition || "Análise registrada"}</Text><MaterialCommunityIcons name="chevron-right" size={22} color={colors.primary} /></View>
          {!preferences.compactHistory ? <Text style={styles.analysisLink}>{preferences.hideHealthPreviews ? "Toque para abrir o registro" : "Ver orientação completa"}</Text> : null}
        </TouchableOpacity>)}
      </>}
    </View>;
  }
  return <SafeAreaView style={styles.safe}>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}><TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")}><MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} /></TouchableOpacity><Text style={styles.title}>Prontuário</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar prontuário" onPress={() => setRevision(value => value + 1)}><MaterialCommunityIcons name="refresh" size={23} color={colors.primary} /></TouchableOpacity></View>
      <View style={styles.people}>
        {people.map(person => <TouchableOpacity accessibilityRole="button" accessibilityState={{ selected: person.id === personId }} key={person.id} onPress={() => selectPerson(person.id)} style={[styles.person, person.id === personId && styles.personActive]}><MaterialCommunityIcons name="account-circle-outline" size={24} color={person.id === personId ? colors.white : colors.primary} /><View><Text style={[styles.personName, person.id === personId && styles.white]}>{person.id === "self" ? "Você" : person.name}</Text><Text style={[styles.personMeta, person.id === personId && styles.white]}>{person.id === "self" ? "Titular" : "Familiar"}</Text></View></TouchableOpacity>)}
        <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("Profile", { openFamilyForm: true })} style={[styles.person, styles.add]}><MaterialCommunityIcons name="plus" size={19} color={colors.primary} /><Text style={styles.personName}>Adicionar</Text></TouchableOpacity>
      </View>
      {!token ? <View style={styles.group}><Text style={styles.notice}>Entre na sua conta para consultar seu prontuário.</Text><Button title="Entrar" onPress={() => navigation.navigate("Login", { returnToPrevious: true })} /></View> : null}
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      <Text style={styles.section}>HISTÓRICO DE SAÚDE</Text>
      <View style={styles.group}>
        <Row icon="account-heart-outline" title="Informações pessoais" subtitle="Pessoa acompanhada e dados do perfil" expanded={expanded === "personal"} onPress={() => toggle("personal")} />
        {expanded === "personal" ? <View style={styles.expanded}><Text style={styles.rowTitle}>{selectedPerson?.name || "Você"}</Text><Text style={styles.muted}>{selectedPerson?.age != null ? `${selectedPerson.age} anos` : "Idade não informada"}</Text><Text style={styles.muted}>{selectedPerson?.relation || "Titular"}</Text></View> : null}
        <Row icon="message-text-outline" title="Sintomas e orientações" subtitle="Seus relatos e análises anteriores" expanded={expanded === "symptoms"} onPress={() => toggle("symptoms")} />
        {expanded === "symptoms" ? analysisList("symptoms") : null}
        <Row icon="file-document-outline" title="Exames e imagens" subtitle="Documentos e resultados organizados" expanded={expanded === "exams"} onPress={() => toggle("exams")} />
        {expanded === "exams" ? analysisList("exams") : null}
      </View>
      <Text style={styles.section}>MONITORAMENTO</Text>
      <View style={styles.group}>
        <Row icon="chart-timeline-variant" title="Variações registradas" subtitle="O que mudou e em qual horário" expanded={expanded === "events"} onPress={() => toggle("events")} />
        {expanded === "events" ? <View style={styles.expanded}>
          <Text style={styles.muted}>Comparação entre medições registradas. Uma variação não confirma uma alteração clínica.</Text>
          {monitoringError ? <Text style={styles.notice}>{monitoringError}</Text> : !monitoring.events.length ? <Text style={styles.notice}>{loading ? "Carregando registros…" : "Ainda não há variações para comparar. São necessárias duas medições diferentes do mesmo indicador."}</Text> : monitoring.events.map(event => <View key={event.id} style={styles.event}><View style={styles.eventTitle}><MaterialCommunityIcons name={event.change > 0 ? "trending-up" : "trending-down"} size={20} color={colors.primary} /><Text style={styles.rowTitle}>{event.label}</Text></View><Text style={styles.values}>{event.previousValue} → {event.value} <Text style={styles.unit}>{event.unit}</Text></Text><Text style={styles.muted}>De {dateTime(event.previousAt)}</Text><Text style={styles.muted}>Para {dateTime(event.measuredAt)}</Text><Text style={styles.muted}>{event.change > 0 ? "Aumento" : "Redução"} de {Math.abs(event.change)} {event.unit} · intervalo de {event.intervalMinutes} min</Text>{event.note ? <Text style={styles.note}>{event.note}</Text> : null}</View>)}
        </View> : null}
        <Row icon="clipboard-pulse-outline" title="Relatório de medições" subtitle="Valores, datas e observações" expanded={expanded === "records"} onPress={() => toggle("records")} />
        {expanded === "records" ? <View style={styles.expanded}>{monitoringError ? <Text style={styles.notice}>{monitoringError}</Text> : !monitoring.records.length ? <Text style={styles.muted}>Nenhuma medição registrada.</Text> : monitoring.records.map(record => <View key={record._id} style={styles.entry}><Text style={styles.rowTitle}>{dateTime(record.measuredAt)}</Text>{record.heartRate != null ? <Text style={styles.note}>Frequência cardíaca: {record.heartRate} bpm</Text> : null}{record.glucose != null ? <Text style={styles.note}>Glicose: {record.glucose} mg/dL</Text> : null}{record.note ? <Text style={styles.muted}>{record.note}</Text> : null}</View>)}<Text style={styles.muted}>Até 100 medições recentes · horários locais do aparelho.</Text></View> : null}
      </View>
      {token ? <Button title="Registrar medição" icon="plus" variant="outline" disabled={loading || Boolean(monitoringError)} onPress={() => { setSaveError(""); setModal(true); }} /> : null}
    </ScrollView>
    <BottomTab navigation={navigation} active="History" />
    <Modal visible={modal} animationType="slide" onRequestClose={() => !saving && setModal(false)}><SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><Text style={styles.title}>Registrar medição</Text><Text style={styles.muted}>{selectedPerson?.name} · o registro usará a data e o horário do envio.</Text><Input label="Frequência cardíaca (bpm)" value={heartRate} onChangeText={setHeartRate} keyboardType="decimal-pad" placeholder="Valor medido" /><Input label="Glicose (mg/dL)" value={glucose} onChangeText={setGlucose} keyboardType="decimal-pad" placeholder="Valor medido" /><Input label="Observação (opcional)" value={note} onChangeText={setNote} multiline placeholder="Ex.: após caminhar, em repouso ou após refeição" />{saveError ? <Text accessibilityRole="alert" style={styles.error}>{saveError}</Text> : null}<Button title="Salvar medição" loading={saving} onPress={saveMeasurement} /><Button title="Cancelar" variant="outline" disabled={saving} onPress={() => setModal(false)} /></ScrollView></SafeAreaView></Modal>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: 20, paddingBottom: 120, gap: 16 },
  heading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { fontFamily, fontSize: 24, fontWeight: "700", color: colors.primary },
  people: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  person: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 28, paddingVertical: 11, paddingHorizontal: 15, backgroundColor: colors.white },
  personActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  personName: { fontFamily, fontSize: 14, fontWeight: "600", color: colors.primary },
  personMeta: { fontFamily, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  white: { color: colors.white }, add: { borderStyle: "dashed", borderColor: colors.primary },
  section: { fontFamily, fontSize: 11, letterSpacing: 1.4, color: colors.textMuted, marginTop: 9 },
  group: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 22, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, minHeight: 78 },
  icon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 }, rowTitle: { fontFamily, fontSize: 15, fontWeight: "600", color: colors.text },
  muted: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.textMuted, marginTop: 3 },
  expanded: { padding: 16, paddingTop: 0, gap: 10 },
  analysisList: { padding: 12, paddingTop: 0, gap: 10 },
  listCaption: { fontFamily, fontSize: 11, color: colors.textMuted, paddingHorizontal: 5, marginBottom: 3 },
  analysisCard: { backgroundColor: colors.background, borderRadius: 17, padding: 16, gap: 12, borderWidth: 1, borderColor: colors.border },
  compactCard: { padding: 12, gap: 8 },
  analysisMeta: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  analysisBadge: { flexDirection: "row", alignItems: "center", gap: 5 },
  analysisKind: { fontFamily, fontSize: 9, fontWeight: "700", letterSpacing: 1, color: colors.primary },
  analysisDate: { fontFamily, fontSize: 10, color: colors.textMuted },
  analysisHeading: { flexDirection: "row", alignItems: "center", gap: 10 },
  analysisTitle: { flex: 1, fontFamily, fontSize: 14, lineHeight: 21, fontWeight: "600", color: colors.text },
  analysisLink: { fontFamily, fontSize: 11, color: colors.primary },
  entry: { borderTopWidth: 1, borderColor: colors.border, paddingVertical: 12, gap: 4 },
  notice: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.textMuted, paddingVertical: 10 },
  event: { backgroundColor: colors.background, padding: 15, borderRadius: 16, gap: 4 },
  eventTitle: { flexDirection: "row", gap: 8, alignItems: "center" },
  values: { fontFamily, fontSize: 24, fontWeight: "700", color: colors.primary, marginVertical: 4 },
  unit: { fontSize: 12, fontWeight: "400" }, note: { fontFamily, fontSize: 13, lineHeight: 21, color: colors.text },
  error: { fontFamily, color: colors.danger, lineHeight: 21 }
});
