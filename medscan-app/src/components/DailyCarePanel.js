import React, { useCallback, useState } from "react";
import { ActivityIndicator, AppState, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { useDesktop } from "../utils/responsive";
import { dailyCare, agendaDateLabel } from "../utils/dailyCare";
import { careRoutes } from "../utils/careRecords";
import { fontFamily } from "../constants/theme";
import api from "../api/client";

export default function DailyCarePanel({ navigation }) {
  const { user, token } = useAuth();
  const { colors, styles } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const scope = `${user?._id || user?.id || "guest"}:${token || ""}`;
  const [state, setState] = useState({ scope: "", status: "loading", records: [], doses: [] });
  const [now, setNow] = useState(() => new Date());
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    let requesting = false;
    setState({ scope, status: token && user ? "loading" : "guest", records: [], doses: [] });
    async function load() {
      if (!active || !token || !user || requesting) return;
      requesting = true;
      setNow(new Date());
      try {
        const { data } = await api.get("/care?personId=self", { timeout: 60000 });
        if (!Array.isArray(data?.records) || !Array.isArray(data?.doses)) throw new Error("Invalid agenda");
        if (active) setState({ scope, status: "ready", records: data.records, doses: data.doses });
      } catch (_) {
        if (active) setState({ scope, status: "error", records: [], doses: [] });
      } finally { requesting = false; }
    }
    load();
    const timer = setInterval(() => setNow(new Date()), 60000);
    const foreground = AppState.addEventListener("change", value => { if (value === "active") load(); });
    const visibility = () => { if (!document.hidden) load(); };
    if (Platform.OS === "web") document.addEventListener("visibilitychange", visibility);
    return () => {
      active = false;
      clearInterval(timer);
      foreground.remove();
      if (Platform.OS === "web") document.removeEventListener("visibilitychange", visibility);
    };
  }, [scope, token, user, revision]));

  const status = !token || !user ? "guest" : state.scope === scope ? state.status : "loading";
  const summary = dailyCare(status === "ready" ? state.records : [], status === "ready" ? state.doses : [], now);
  const medication = summary.medication;
  const appointment = summary.appointment;
  const vaccine = summary.vaccine;
  const open = (kind, date) => navigation.navigate(careRoutes[kind], { section: kind, personId: "self", agendaDate: date, revision: Date.now() });
  const cards = [
    {
      kind: "medication", icon: "pill", label: "Medicamentos", accent: colors.primary,
      badge: medication ? `${agendaDateLabel(medication.date, now)} · ${medication.time}` : summary.pendingEarlier ? "Confira a agenda de hoje" : "Agenda livre",
      title: medication?.record.name || (summary.pendingEarlier ? "Horários sem confirmação" : "Sem horários programados"),
      detail: medication?.record.dose || (summary.pendingEarlier ? "Consulte os registros da sua rotina." : "Adicione os horários da sua prescrição."),
      footer: summary.pendingEarlier ? `${summary.pendingEarlier} ${summary.pendingEarlier === 1 ? "horário anterior sem confirmação" : "horários anteriores sem confirmação"}`
        : summary.dosesToday ? `${summary.takenToday} de ${summary.dosesToday} tomadas registradas hoje` : "Ver minha rotina",
      date: medication?.date || summary.firstEarlier?.date
    },
    {
      kind: "appointment", icon: "calendar-clock", label: "Consultas", accent: colors.info,
      badge: appointment ? `${agendaDateLabel(appointment.date, now)} · ${appointment.time}` : "Agenda livre",
      title: appointment?.name || "Nenhuma consulta marcada",
      detail: appointment?.location || (appointment ? "Local não informado" : "Organize seu próximo atendimento."),
      footer: "Abrir calendário", date: appointment?.date
    },
    {
      kind: "vaccine", icon: "needle", label: "Vacinação", accent: colors.purple,
      badge: vaccine ? agendaDateLabel(vaccine.date, now) : "Sem próxima data",
      title: vaccine?.record.name || "Nenhuma dose prevista",
      detail: vaccine?.record.location || (vaccine ? "Data informada na sua carteira." : "Registre as datas da sua carteira."),
      footer: "Ver minha carteira", date: vaccine?.date
    }
  ];
  return <View style={styles.panel}>
    <View style={styles.headingRow}>
      <View style={{ flex: 1, gap: 4 }}><Text accessibilityRole="header" style={styles.heading}>Meu dia</Text><Text style={styles.subtitle}>Sua rotina e os próximos cuidados.</Text></View>
      {status !== "guest" ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar Meu dia" disabled={status === "loading"} onPress={() => setRevision(value => value + 1)} style={styles.refresh}><MaterialCommunityIcons name="refresh" size={21} color={colors.primary}/></TouchableOpacity> : null}
    </View>
    {status === "guest" ? <View style={styles.notice}><MaterialCommunityIcons name="calendar-heart" size={25} color={colors.primary}/><View style={{ flex: 1, gap: 6 }}><Text style={styles.title}>Seu cuidado começa aqui</Text><Text style={styles.detail}>Entre para ver seus medicamentos, consultas e vacinação.</Text><TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate("Login", { returnToPrevious: true })}><Text style={styles.link}>Entrar na minha conta →</Text></TouchableOpacity></View></View>
      : status === "loading" ? <View style={styles.notice} accessibilityLiveRegion="polite"><ActivityIndicator color={colors.primary}/><Text style={styles.detail}>Carregando sua agenda…</Text></View>
      : status === "error" ? <View style={styles.notice}><MaterialCommunityIcons name="cloud-alert-outline" size={25} color={colors.primary}/><View style={{ flex: 1, gap: 6 }}><Text accessibilityRole="alert" style={styles.detail}>Não foi possível carregar sua agenda.</Text><TouchableOpacity accessibilityRole="button" onPress={() => setRevision(value => value + 1)}><Text style={styles.link}>Tentar novamente</Text></TouchableOpacity></View></View>
      : <View style={[styles.cards, desktop && styles.desktopCards]}>{cards.map(card => <TouchableOpacity key={card.kind} accessibilityRole="button" onPress={() => open(card.kind, card.date)} style={[styles.card, desktop && { flex: 1 }]} activeOpacity={0.8}>
        <View style={styles.cardTop}><View style={[styles.icon, { backgroundColor: `${card.accent}16` }]}><MaterialCommunityIcons name={card.icon} size={22} color={card.accent}/></View><Text style={styles.label}>{card.label}</Text><MaterialCommunityIcons name="chevron-right" size={18} color={colors.textMuted}/></View>
        <Text style={[styles.badge, { color: card.accent }]}>{card.badge}</Text><Text style={styles.title}>{card.title}</Text><Text style={styles.detail}>{card.detail}</Text><Text style={styles.footer}>{card.footer}</Text>
      </TouchableOpacity>)}</View>}
  </View>;
}

const createStyles = colors => StyleSheet.create({
  panel: { gap: 14 }, headingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heading: { fontFamily, fontSize: 20, fontWeight: "700", color: colors.text, letterSpacing: -0.5 },
  subtitle: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.textMuted },
  refresh: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cards: { gap: 10 }, desktopCards: { flexDirection: "row", alignItems: "stretch" },
  card: { minWidth: 0, padding: 18, gap: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 21 },
  cardTop: { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 4 }, icon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  label: { fontFamily, fontSize: 12, fontWeight: "600", color: colors.textMuted, flex: 1 },
  badge: { fontFamily, fontSize: 12, lineHeight: 18, fontWeight: "700" }, title: { fontFamily, fontSize: 16, lineHeight: 22, fontWeight: "700", color: colors.text },
  detail: { fontFamily, fontSize: 12, lineHeight: 18, color: colors.textMuted }, footer: { fontFamily, fontSize: 11, lineHeight: 17, color: colors.primary, marginTop: 5 },
  notice: { padding: 20, gap: 14, flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 21, borderWidth: 1, borderColor: colors.border },
  link: { fontFamily, fontSize: 12, fontWeight: "700", lineHeight: 24, color: colors.primary }
});
