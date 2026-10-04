import ThemePreference from "../components/ThemePreference";
import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Switch, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import BrandHero from "../components/BrandHero";
import { LinearGradient } from "expo-linear-gradient";
import { RecordArtwork } from "../components/HomeArtwork";
import Button from "../components/Button";
import Input from "../components/Input";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { fontFamily } from "../constants/theme";

const options = [
  ["privacy", "shield-lock-outline", "Privacidade", "Controle as prévias do prontuário"],
  ["notifications", "bell-outline", "Notificações", "Escolha o que aparece na central"],
  ["preferences", "tune-variant", "Preferências", "Seu prontuário, do seu jeito"],
  ["help", "help-circle-outline", "Ajuda", "Respostas para o dia a dia"]
];
const titles = { edit: "Seus dados", family: "Adicionar familiar", privacy: "Privacidade", notifications: "Notificações", preferences: "Preferências", help: "Como podemos ajudar?", logout: "Sair da conta?" };
const faqs = [
  ["Onde encontro uma análise anterior?", "Abra Prontuário e toque em Sintomas e orientações ou Exames e imagens. Selecione um registro para ver a orientação completa."],
  ["Como acompanho um familiar?", "Adicione o nome e a idade no perfil. Depois selecione essa pessoa no prontuário ou no monitoramento para consultar os registros dela."],
  ["Por que uma medição aparece vazia?", "Um traço indica que não há uma medição disponível. No prontuário, use Registrar medição quando o serviço estiver disponível."],
  ["Não consigo acessar meus dados", "Confira sua conexão e tente carregar a página novamente. Se a sessão expirou, entre na conta de novo. Seus registros salvos ficam associados à sua conta."]
];
function SettingSwitch({ title, description, value, onValueChange }) {
  const { colors, styles: s } = useAppTheme(createStyles);
  return <View style={s.switchRow}><View style={s.copy}><Text style={s.rowTitle}>{title}</Text><Text style={s.muted}>{description}</Text></View><Switch accessibilityLabel={title} value={value} onValueChange={onValueChange} trackColor={{ false: colors.switchOff, true: colors.primary }} thumbColor="#FFFFFF" /></View>;
}
export default function ProfileScreen({ navigation, route }) {
  const { colors, styles: s } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const { user, token, logout, refreshMe } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState("");
  const [draft, setDraft] = useState({});
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [faq, setFaq] = useState(-1);
  useFocusEffect(useCallback(() => {
    let active = true;
    setData(null); setError("");
    if (!token) return;
    setLoading(true);
    api.get("/profile").then(response => { if (active) setData(response.data); }).catch(() => { if (active) setError("Não foi possível carregar seu perfil."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, revision]));
  useEffect(() => {
    if (route.params?.openFamilyForm && data) { open("family"); navigation.setParams({ openFamilyForm: false }); }
  }, [route.params?.openFamilyForm, data]);
  const person = data?.user || user || {};
  const relatives = data?.profile?.relatives || [];
  function open(key) {
    setSaveError(""); setNotice(""); setDraft(data?.profile?.settings || {});
    setName(key === "edit" ? person.name || "" : ""); setAge(key === "edit" && person.age != null ? String(person.age) : ""); setModal(key);
  }
  function preference(key, value) { setDraft(current => ({ ...current, appPreferences: { ...current.appPreferences, [key]: value } })); }
  async function save() {
    if (saving) return;
    let payload;
    if (modal === "edit" || modal === "family") {
      if (!name.trim()) { setSaveError("Informe o nome."); return; }
      if (age.trim() && (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120)) { setSaveError("Informe uma idade entre 0 e 120 anos."); return; }
      payload = modal === "edit" ? { name: name.trim(), ...(age.trim() ? { age: Number(age) } : {}) } : { relatives: [...relatives, { id: `relative-${Date.now()}`, name: name.trim(), age: age.trim() ? Number(age) : null, relation: "Familiar monitorado", icon: "account-heart" }] };
    } else payload = { settings: draft };
    setSaving(true); setSaveError("");
    try {
      if (["privacy", "notifications", "preferences"].includes(modal)) {
        const current = await api.get("/profile");
        const settings = current.data.profile?.settings || {};
        const appPreferences = { ...settings.appPreferences };
        if (modal === "privacy") appPreferences.hideHealthPreviews = draft.appPreferences?.hideHealthPreviews === true;
        if (modal === "preferences") {
          appPreferences.compactHistory = draft.appPreferences?.compactHistory === true;
          appPreferences.oldestFirst = draft.appPreferences?.oldestFirst === true;
        }
        payload = { settings: { ...settings, appPreferences, ...(modal === "notifications" ? { notifications: draft.notifications !== false } : {}) } };
      }
      const response = await api.put("/profile", payload);
      setData(response.data);
      if (modal === "edit") await refreshMe().catch(() => {});
      setModal(""); setNotice("Alterações salvas na sua conta.");
      return true;
    } catch (_) { setSaveError("Não foi possível salvar. Suas alterações continuam aqui para tentar novamente."); }
    finally { setSaving(false); }
  }
  const initials = (person.name || "Você").trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();
  const editable = ["edit", "family", "privacy", "notifications", "preferences"].includes(modal);
  return <SafeAreaView style={[s.safe, desktop && desktopPage]}>
    <ScrollView contentContainerStyle={[s.content, desktop && desktopContent]} showsVerticalScrollIndicator={false}>
      <BrandHero title="Meu perfil" subtitle="Seu cuidado começa com você." onNotifications={() => navigation.navigate("Notifications")} />
      <LinearGradient colors={[colors.hero, colors.heroHalo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.identity, { overflow: "hidden" }]}>
        <View pointerEvents="none" style={{ position: "absolute", right: -25, bottom: -40, opacity: 0.25 }}><RecordArtwork /></View>
        <View style={s.identityTop}><View style={s.avatar}><Text style={s.initials}>{initials}</Text></View><View style={s.accountBadge}><Text style={s.accountText}>{token ? "SUA CONTA" : "BOAS-VINDAS"}</Text></View></View>
        <Text style={s.name}>{person.name || "Seu espaço de cuidado"}</Text>
        <Text style={s.email}>{person.email || "Entre para organizar seus dados de saúde"}</Text>
        <TouchableOpacity accessibilityRole="button" disabled={Boolean(token) && !data} style={s.editButton} onPress={() => token ? open("edit") : navigation.navigate("Login", { returnToPrevious: true })}><Text style={s.editText}>{token ? "Editar meus dados" : "Entrar na conta"}</Text><Icon name="arrow-top-right" size={18} color={colors.primary} /></TouchableOpacity>
      </LinearGradient>
      {loading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <View style={s.group}><Text style={s.error}>Não foi possível carregar seu perfil.</Text><Button title="Tentar novamente" variant="soft" onPress={() => setRevision(value => value + 1)} /></View> : null}
      {notice ? <Text accessibilityRole="alert" style={s.success}>{notice}</Text> : null}
      <Text style={s.section}>SEU CUIDADO</Text>
      <View style={s.shortcuts}>
        <TouchableOpacity accessibilityRole="button" style={s.shortcut} onPress={() => navigation.navigate("Monitoring")}><View style={s.icon}><Icon name="heart-pulse" size={23} color={colors.primary} /></View><Text style={s.rowTitle}>Monitoramento</Text><Text style={s.muted}>Acompanhar medições</Text><Icon name="arrow-right" size={20} color={colors.primary} /></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" disabled={Boolean(token) && !data} style={s.shortcut} onPress={() => token ? open("family") : navigation.navigate("Login", { returnToPrevious: true })}><View style={s.icon}><Icon name="account-group-outline" size={23} color={colors.primary} /></View><Text style={s.rowTitle}>Minha família</Text><Text style={s.muted}>{data ? `${relatives.length} ${relatives.length === 1 ? "pessoa cadastrada" : "pessoas cadastradas"}` : "Pessoas que você cuida"}</Text><Text style={s.link}>+ Adicionar</Text></TouchableOpacity>
      </View>
      {relatives.length ? <View style={s.familyList}>{relatives.map(relative => <View key={relative.id} style={s.familyChip}><Icon name="account-outline" size={16} color={colors.primary} /><Text style={s.muted}>{relative.name}</Text></View>)}</View> : null}
      <Text style={s.section}>AJUSTES DA CONTA</Text>
      <View style={s.settings}>{options.map(([key, icon, title, description], index) => <TouchableOpacity accessibilityRole="button" key={key} disabled={!["help", "preferences"].includes(key) && Boolean(token) && !data} style={[s.row, index > 0 && s.separator]} onPress={() => ["help", "preferences"].includes(key) || token ? open(key) : navigation.navigate("Login", { returnToPrevious: true })}><View style={s.icon}><Icon name={icon} size={22} color={colors.primary} /></View><View style={s.copy}><Text style={s.rowTitle}>{title}</Text><Text style={s.muted}>{description}</Text></View><Icon name="chevron-right" size={20} color={colors.textMuted} /></TouchableOpacity>)}</View>
      {token ? <TouchableOpacity accessibilityRole="button" style={s.logout} onPress={() => open("logout")}><Icon name="logout" size={19} color={colors.textMuted} /><Text style={s.muted}>Sair da conta</Text></TouchableOpacity> : null}
    </ScrollView>
    <BottomTab navigation={navigation} active="Profile" />
    <Modal visible={Boolean(modal)} transparent animationType="slide" onRequestClose={() => !saving && setModal("")}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.backdrop}><SafeAreaView style={s.sheet}>
        <View style={s.sheetHeader}><Text style={s.sheetTitle}>{titles[modal]}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar" disabled={saving} onPress={() => setModal("")}><Icon name="close" size={24} color={colors.primary} /></TouchableOpacity></View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.sheetBody}>
          {modal === "edit" || modal === "family" ? <><Text style={s.muted}>{modal === "family" ? "Adicione uma pessoa para organizar o acompanhamento dela." : person.email}</Text><Input label="Nome" value={name} onChangeText={setName} placeholder="Nome completo" /><Input label="Idade (opcional)" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="Idade em anos" /></> : null}
          {modal === "privacy" ? <><SettingSwitch title="Ocultar prévias de saúde" description="Esconde os títulos das análises nas listas do prontuário e da central. Os detalhes continuam acessíveis ao abrir um registro." value={draft.appPreferences?.hideHealthPreviews === true} onValueChange={value => preference("hideHealthPreviews", value)} /><View style={s.tip}><Icon name="information-outline" size={22} color={colors.primary} /><Text style={[s.muted, s.copy]}>Esta opção altera a exibição das listas. Ao terminar de usar um aparelho compartilhado, saia da sua conta.</Text></View></> : null}
          {modal === "notifications" ? <><SettingSwitch title="Atualizações na central" description="Mostra suas análises recentes na página Notificações. Esta opção não ativa notificações push no celular." value={draft.notifications !== false} onValueChange={value => setDraft(current => ({ ...current, notifications: value }))} /><Button title="Salvar e abrir central" variant="soft" loading={saving} onPress={async () => { if (await save()) navigation.navigate("Notifications"); }} /></> : null}
          {modal === "preferences" ? <><ThemePreference />{token && data ? <><SettingSwitch title="Lista compacta" description="Reduz o espaço dos cartões de análises no prontuário." value={draft.appPreferences?.compactHistory === true} onValueChange={value => preference("compactHistory", value)} /><SettingSwitch title="Mais antigos primeiro" description="Altera a ordem das análises no prontuário. Desativado: mais recentes primeiro." value={draft.appPreferences?.oldestFirst === true} onValueChange={value => preference("oldestFirst", value)} /></> : null}</> : null}
          {modal === "help" ? faqs.map(([question, answer], index) => <View key={question} style={s.faq}><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: faq === index }} style={s.faqHeading} onPress={() => setFaq(faq === index ? -1 : index)}><Text style={[s.rowTitle, s.copy]}>{question}</Text><Icon name={faq === index ? "minus" : "plus"} size={20} color={colors.primary} /></TouchableOpacity>{faq === index ? <Text style={s.muted}>{answer}</Text> : null}</View>) : null}
          {modal === "logout" ? <><Text style={s.muted}>Você precisará entrar novamente para acessar seus registros.</Text><Button title="Sair da conta" loading={saving} onPress={async () => { setSaving(true); try { await logout(); setModal(""); navigation.reset({ index: 0, routes: [{ name: "Welcome" }] }); } catch (_) { setSaveError("Não foi possível encerrar a sessão. Tente novamente."); } finally { setSaving(false); } }} /><Button title="Continuar no app" variant="soft" disabled={saving} onPress={() => setModal("")} /></> : null}
          {saveError ? <Text accessibilityRole="alert" style={s.error}>{saveError}</Text> : null}
          {editable && (modal !== "preferences" || (token && data)) ? <Button title="Salvar alterações" loading={saving} onPress={save} /> : null}
        </ScrollView>
      </SafeAreaView></KeyboardAvoidingView>
    </Modal>
  </SafeAreaView>;
}
const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: 20, paddingBottom: 120, gap: 16 },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9 }, pageTitle: { fontFamily, fontSize: 24, fontWeight: "700", color: colors.text }, brand: { flexDirection: "row", alignItems: "center", gap: 5 }, brandText: { fontFamily, fontSize: 10, letterSpacing: 1, fontWeight: "700", color: colors.primary },
  identity: { backgroundColor: colors.hero, padding: 24, borderRadius: 26, gap: 9 }, identityTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }, avatar: { width: 60, height: 60, borderRadius: 21, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" }, initials: { fontFamily, fontSize: 23, color: colors.primary, fontWeight: "700" }, accountBadge: { borderWidth: 1, borderColor: "#47897E", padding: 8, borderRadius: 20 }, accountText: { fontFamily, color: "#D4EDE6", fontSize: 9, letterSpacing: 1.3 }, name: { fontFamily, fontSize: 26, fontWeight: "700", color: "white" }, email: { fontFamily, fontSize: 13, color: "#D4EDE6" }, editButton: { alignSelf: "flex-start", backgroundColor: colors.primaryLight, borderRadius: 12, padding: 12, flexDirection: "row", gap: 12, marginTop: 9, alignItems: "center" }, editText: { fontFamily, color: colors.primary, fontSize: 12, fontWeight: "600" },
  section: { fontFamily, fontSize: 10, letterSpacing: 1.7, color: colors.textMuted, marginTop: 9 }, shortcuts: { flexDirection: "row", gap: 12 }, shortcut: { flex: 1, minWidth: 0, padding: 16, gap: 9, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border }, icon: { width: 40, height: 40, backgroundColor: colors.primaryLight, borderRadius: 13, alignItems: "center", justifyContent: "center" }, rowTitle: { fontFamily, fontSize: 14, fontWeight: "600", color: colors.text }, muted: { fontFamily, fontSize: 12, lineHeight: 19, color: colors.textMuted }, copy: { flex: 1, minWidth: 0, gap: 4 }, link: { fontFamily, fontSize: 12, fontWeight: "600", color: colors.primary }, familyList: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, familyChip: { flexDirection: "row", alignItems: "center", gap: 4, padding: 8, backgroundColor: colors.primaryLight, borderRadius: 12 },
  settings: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, row: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12, minHeight: 80 }, separator: { borderTopWidth: 1, borderColor: colors.border }, logout: { alignSelf: "center", flexDirection: "row", gap: 9, alignItems: "center", padding: 15 }, group: { padding: 16, gap: 12 }, error: { fontFamily, color: colors.danger, fontSize: 13, lineHeight: 20 }, success: { fontFamily, color: colors.primary, fontSize: 13 },
  backdrop: { flex: 1, justifyContent: "flex-end", alignItems: "center", backgroundColor: "rgba(10,35,30,0.45)" }, sheet: { width: "100%", maxWidth: 640, maxHeight: "90%", backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28 }, sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 22, gap: 12 }, sheetTitle: { flex: 1, fontFamily, fontSize: 21, fontWeight: "700", color: colors.text }, sheetBody: { padding: 22, paddingTop: 0, paddingBottom: 32, gap: 20 }, switchRow: { flexDirection: "row", alignItems: "center", gap: 15, paddingVertical: 12 }, tip: { backgroundColor: colors.background, padding: 16, borderRadius: 16, flexDirection: "row", gap: 10 }, faq: { backgroundColor: colors.background, padding: 16, borderRadius: 16, gap: 12 }, faqHeading: { flexDirection: "row", alignItems: "center", gap: 10 }
});
