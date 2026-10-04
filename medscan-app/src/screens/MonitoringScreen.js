import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import BottomTab from "../components/BottomTab";
import Card from "../components/Card";
import DeviceCard from "../components/DeviceCard";
import HealthCard from "../components/HealthCard";
import { HeaderArtwork } from "../components/HomeArtwork";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { fontFamily, radius, shadows } from "../constants/theme";
import MedscanWordmark from "../components/MedscanWordmark";
import {
  DEFAULT_MONITORED_PERSON_ID,
  MONITORED_PERSON_STORAGE_KEY,
  getMonitoredPeople,
  findMonitoredPerson,
} from "../utils/monitoredPeople";
import { mockDevices } from "../utils/mockData";
import { demoVitals } from "../utils/demoVitals";
import { getStoredItem, setStoredItem } from "../utils/storage";

export default function MonitoringScreen({ navigation }) {
  const { colors, styles, isDark } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const { user } = useAuth();
  const [monitoring, setMonitoring] = useState({ vitals: {}, alerts: [] });
  const [devices, setDevices] = useState(mockDevices);
  const [people, setPeople] = useState(() => getMonitoredPeople(user));
  const [selectedPersonId, setSelectedPersonId] = useState(DEFAULT_MONITORED_PERSON_ID);
  const [showPeopleMenu, setShowPeopleMenu] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function load() {
        try {
          const [profileResponse, monitoringResponse, devicesResponse] = await Promise.all([
            api.get("/profile"),
            api.get(`/monitoring?personId=${selectedPersonId}`),
            api.get("/devices")
          ]);

          if (mounted) {
            const profile = profileResponse.data.profile || {};
            const loadedPeople = getMonitoredPeople(profileResponse.data.user || user, profile.relatives || []);
            setPeople(loadedPeople);
            if (!loadedPeople.some((person) => person.id === selectedPersonId)) {
              setSelectedPersonId(DEFAULT_MONITORED_PERSON_ID);
              await setStoredItem(MONITORED_PERSON_STORAGE_KEY, DEFAULT_MONITORED_PERSON_ID);
            }
            setMonitoring(monitoringResponse.data);
            setDevices(devicesResponse.data.length ? devicesResponse.data : mockDevices);
          }
        } catch (error) {
          if (mounted) {
            setMonitoring({ vitals: {}, alerts: [] });
            setDevices(mockDevices);
          }
        }
      }

      load();

      return () => {
        mounted = false;
      };
    }, [selectedPersonId, user])
  );

  useEffect(() => {
    let mounted = true;

    async function restoreSelectedPerson() {
      const storedPersonId = await getStoredItem(MONITORED_PERSON_STORAGE_KEY);

      if (mounted && storedPersonId) {
        setSelectedPersonId(storedPersonId);
      }
    }

    restoreSelectedPerson();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedPerson = findMonitoredPerson(selectedPersonId, people);
  const vitals = monitoring.vitals || {};
  const alerts = monitoring.alerts || [];
  const hasDemoVitals = ["heartRate", "glucose", "bloodPressure", "sleep"].some(key => vitals[key] == null);

  async function selectPerson(personId) {
    setSelectedPersonId(personId);
    setShowPeopleMenu(false);
    await setStoredItem(MONITORED_PERSON_STORAGE_KEY, personId);
  }

  return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]}>
      <ScrollView contentContainerStyle={[styles.content, desktop && desktopContent]} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.heroStart, colors.heroEnd]} start={{x:0,y:0}} end={{x:1,y:1}} style={[styles.monitorHero, desktop && {borderRadius:28}]}>
          <HeaderArtwork dark={isDark} />
          <View style={styles.brandRow}>
            <View style={styles.brand}>
              <LinearGradient colors={["#15B497", "#076457"]} style={styles.brandMark}>
                <MaterialCommunityIcons name="pulse" size={23} color="white"/>
              </LinearGradient>
              <MedscanWordmark size={18} dark={colors.primary} light={colors.primaryMedium} />
            </View>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notificações" onPress={() => navigation.navigate("Notifications")} style={styles.bell}>
              <MaterialCommunityIcons name="bell-outline" size={23} color={colors.primary}/>
            </TouchableOpacity>
          </View>
          <Text style={styles.heroTitle}>Monitoramento</Text>
          <Text style={styles.heroSubtitle}>Acompanhe sinais vitais, alertas e dispositivos em um só lugar</Text>
          <View style={styles.heroBadge}>
            <View style={styles.heroDot}/>
            <Text style={styles.heroBadgeText}>{hasDemoVitals ? "Dados de demonstração" : "Medições registradas"}</Text>
          </View>
        </LinearGradient>
        <View style={styles.body}>

        <View style={styles.personArea}>
          <Card style={styles.personCard}>
            <View style={styles.personMain}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons name={selectedPerson.icon} size={50} color={colors.primary} />
              </View>
              <View style={styles.personCopy}>
                <Text style={styles.personName} numberOfLines={2}>{selectedPerson.name}</Text>
                <Text style={styles.personMeta} numberOfLines={2}>
                  {selectedPerson.age != null ? `${selectedPerson.age} anos | ` : ""}{selectedPerson.relation}
                </Text>
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{hasDemoVitals ? "Dados de demonstração" : monitoring.monitoredPerson?.status || "Medições registradas"}</Text>
                </View>
              </View>
            </View>
            <View style={styles.personActions}>
              <TouchableOpacity style={styles.profileButton} activeOpacity={0.84}>
                <MaterialCommunityIcons name="account-outline" size={18} color={colors.primary} />
                <Text style={styles.profileButtonText}>Ver perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.switchButton}
                activeOpacity={0.84}
                onPress={() => setShowPeopleMenu((current) => !current)}
              >
                <MaterialCommunityIcons
                  name={showPeopleMenu ? "chevron-up" : "chevron-down"}
                  size={26}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </Card>

          {showPeopleMenu ? (
            <Card style={styles.peopleMenu}>
              <Text style={styles.menuTitle}>Trocar pessoa monitorada</Text>
              {people.map((person) => {
                const isCurrent = person.id === selectedPersonId;

                return (
                  <TouchableOpacity
                    key={person.id}
                    style={[styles.personOption, isCurrent && styles.personOptionActive]}
                    activeOpacity={0.84}
                    onPress={() => selectPerson(person.id)}
                  >
                    <View style={styles.optionAvatar}>
                      <MaterialCommunityIcons name={person.icon} size={28} color={colors.primary} />
                    </View>
                    <View style={styles.optionCopy}>
                      <Text style={styles.optionName}>{person.name}</Text>
                      <Text style={styles.optionAge}>{person.age} anos</Text>
                    </View>
                    {isCurrent ? (
                      <View style={styles.currentBadge}>
                        <Text style={styles.currentText}>Atual</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={styles.addPersonOption}
                activeOpacity={0.84}
                onPress={() => navigation.navigate("Profile", { openFamilyForm: true })}
              >
                <View style={styles.addPersonIcon}>
                  <MaterialCommunityIcons name="plus" size={28} color={colors.primary} />
                </View>
                <View>
                  <Text style={styles.addPersonTitle}>Adicionar pessoa</Text>
                  <Text style={styles.addPersonSubtitle}>Monitorar novo familiar</Text>
                </View>
              </TouchableOpacity>
            </Card>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="pulse" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sinais vitais</Text>
          </View>
          <TouchableOpacity
            style={styles.measureAction}
            activeOpacity={0.86}
            onPress={() => Alert.alert("Medicao", "Cadastro manual de sinais vitais pronto para expansao.")}
          >
            <MaterialCommunityIcons name="plus" size={19} color={colors.primary} />
            <Text style={styles.measureActionText}>Registrar medição</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.measureMeta}>
          <Text style={styles.updated}>{hasDemoVitals ? "Dados de demonstração" : "Medições registradas"}</Text>
          <MaterialCommunityIcons name="refresh" size={18} color={colors.textMuted} />
        </View>

        <View style={styles.grid}>
          <HealthCard status={vitals.heartRate == null ? "Demonstração" : "Registrado"} title="Frequência cardíaca" value={vitals.heartRate ?? demoVitals.heartRate} unit="bpm" icon="heart-pulse" color={isDark ? "#F497A7" : "#D86879"} pulse />
          <HealthCard status={vitals.glucose == null ? "Demonstração" : "Registrado"} title="Glicose" value={vitals.glucose ?? demoVitals.glucose} unit="mg/dL" icon="water-outline" color={isDark ? "#70DCB4" : "#199D7C"} />
          <HealthCard status={vitals.bloodPressure == null ? "Demonstração" : "Registrado"} title="Pressão arterial" value={vitals.bloodPressure ?? demoVitals.bloodPressure} unit="mmHg" icon="gauge" color={isDark ? "#79C3EB" : "#388FB9"} />
          <HealthCard title="Sono" value={vitals.sleep ?? demoVitals.sleep} unit="" icon="sleep" color={isDark ? "#C3ABF4" : "#7E57C2"} status={vitals.sleep == null ? "Demonstração" : "Registrado"} bars />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Alertas e lembretes</Text>
          </View>
          <Text style={styles.link}>Ver todos</Text>
        </View>

        <View style={styles.alertGrid}>
          {!alerts.length ? <Card style={styles.alertCard}>
            <View style={[styles.alertIcon, { backgroundColor: colors.primaryLight }]}><MaterialCommunityIcons name="bell-check-outline" size={26} color={colors.primary} /></View>
            <View style={styles.alertCopy}><Text style={styles.alertTitle}>Nenhum alerta para exibir</Text><Text style={styles.alertDescription}>Seus alertas e lembretes aparecerão aqui.</Text></View>
          </Card> : null}
          {alerts.map((alert) => (
            <Card key={alert.title} style={styles.alertCard} bordered>
              <View style={styles.alertIcon}>
                <MaterialCommunityIcons
                  name={alert.level === "Atencao" || alert.level === "Atenção" ? "alert" : "pill"}
                  size={30}
                  color={alert.level === "Atencao" || alert.level === "Atenção" ? colors.warning : colors.info}
                />
              </View>
              <View style={styles.alertCopy}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertDescription}>{alert.description}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
            </Card>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="devices" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Dispositivos conectados</Text>
          </View>
          <Text style={styles.link}>Gerenciar</Text>
        </View>

        <View style={styles.grid}>
          {devices.map((device) => (
            <DeviceCard key={device._id || device.name} device={device} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.addDevice}
          activeOpacity={0.86}
          onPress={() => Alert.alert("Dispositivo", "Fluxo preparado para conectar novo aparelho de saude.")}
        >
          <View style={styles.addIcon}>
            <MaterialCommunityIcons name="plus" size={34} color={colors.primary} />
          </View>
          <View style={styles.addCopy}>
            <Text style={styles.addTitle}>Adicionar dispositivo</Text>
            <Text style={styles.addSubtitle}>Conecte um novo aparelho de saude</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={28} color={colors.primary} />
        </TouchableOpacity>

        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Monitoring" />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  monitorHero: { padding:24, paddingBottom:28, borderBottomLeftRadius:32, borderBottomRightRadius:32, overflow:"hidden" },
  brandRow: { flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:27 },
  brand: { flexDirection:"row", alignItems:"center", gap:10 },
  brandMark: { width:40, height:40, borderRadius:13, alignItems:"center", justifyContent:"center" },
  bell: { width:42, height:42, borderRadius:16, backgroundColor:colors.surface, alignItems:"center", justifyContent:"center" },
  heroTitle: { fontFamily, fontSize:29, fontWeight:"700", letterSpacing:-1, color:colors.text },
  heroSubtitle: { fontFamily, color:colors.text, opacity:0.8, fontSize:14, lineHeight:21, marginTop:6, maxWidth:460 },
  heroBadge: { flexDirection:"row", gap:7, alignItems:"center", alignSelf:"flex-start", backgroundColor:colors.primaryLight, paddingVertical:8, paddingHorizontal:12, borderRadius:20, marginTop:20 },
  heroDot: { width:7, height:7, borderRadius:4, backgroundColor:colors.primaryMedium },
  heroBadgeText: { fontFamily, fontSize:12, color:colors.primary, fontWeight:"500" },
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: { width: "100%", maxWidth: 720, alignSelf: "center", paddingBottom: 130 },
  body: { padding: 20, gap: 17 },
  personArea: {
    position: "relative",
    zIndex: 4
  },
  personCard: {
    gap: 14,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#075E52",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  personMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    width: "100%"
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  personCopy: {
    flex: 1,
    minWidth: 0
  },
  personName: {
    color: colors.text,
    fontFamily, fontSize: 20,
    fontWeight: "700"
  },
  personMeta: {
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "700",
    marginTop: 4
  },
  statusBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.successLight,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.success
  },
  statusText: {
    color: colors.successText,
    fontWeight: "700"
  },
  personActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    width: "100%",
    flexWrap: "nowrap"
  },
  profileButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexShrink: 1,
    minWidth: 112
  },
  profileButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontFamily, fontSize: 13
  },
  switchButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  peopleMenu: {
    position: "absolute",
    top: "100%",
    right: 0,
    width: 380,
    maxWidth: "100%",
    gap: 10,
    zIndex: 10
  },
  menuTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700",
    marginBottom: 2
  },
  personOption: {
    minHeight: 64,
    borderRadius: radius.md,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  personOptionActive: {
    backgroundColor: colors.primaryLight
  },
  optionAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  optionCopy: {
    flex: 1
  },
  optionName: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700"
  },
  optionAge: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily, fontSize: 13,
    fontWeight: "700"
  },
  currentBadge: {
    borderRadius: 999,
    backgroundColor: colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  currentText: {
    color: colors.successText,
    fontFamily, fontSize: 12,
    fontWeight: "700"
  },
  addPersonOption: {
    minHeight: 68,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primaryMedium,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 13
  },
  addPersonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  addPersonTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700"
  },
  addPersonSubtitle: {
    color: colors.textMuted,
    fontFamily, fontSize: 13,
    fontWeight: "700",
    marginTop: 2
  },
  sectionHeader: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1
  },
  sectionTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3
  },
  updated: {
    color: colors.textMuted,
    fontFamily, fontSize: 11,
    fontWeight: "600"
  },
  measureAction: {
    minHeight: 38,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primaryMedium,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  measureActionText: {
    color: colors.primary,
    fontFamily, fontSize: 12,
    fontWeight: "800"
  },
  measureMeta: {
    marginTop: -8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 6
  },
  link: {
    color: colors.primary,
    fontFamily, fontSize: 11,
    fontWeight: "600",
    paddingVertical: 8
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12
  },
  alertGrid: {
    gap: 12
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 20
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.warningLight,
    alignItems: "center",
    justifyContent: "center"
  },
  alertCopy: {
    flex: 1
  },
  alertTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700"
  },
  alertDescription: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily, fontSize: 13,
    fontWeight: "700"
  },
  addDevice: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    ...shadows.card
  },
  addIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primaryMedium,
    alignItems: "center",
    justifyContent: "center"
  },
  addCopy: {
    flex: 1
  },
  addTitle: {
    color: colors.primary,
    fontFamily, fontSize: 17,
    fontWeight: "700"
  },
  addSubtitle: {
    color: colors.textMuted,
    marginTop: 3,
    fontFamily, fontSize: 13,
    fontWeight: "700"
  }
});
