import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Card from "../components/Card";
import DeviceCard from "../components/DeviceCard";
import BrandHero from "../components/BrandHero";
import HealthCard from "../components/HealthCard";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { fontFamily, radius } from "../constants/theme";
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
  const { colors, styles } = useAppTheme(createStyles);
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
        <BrandHero
          onNotifications={() => navigation.navigate("Notifications")}
          title="Monitoramento"
          subtitle="Acompanhe seus sinais vitais"
        />
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
          <View style={styles.sectionTitleRow}>
            <Text style={styles.updated}>{hasDemoVitals ? "Demonstração" : "Registradas"}</Text>
            <MaterialCommunityIcons name="refresh" size={20} color={colors.textMuted} />
          </View>
        </View>

        <View style={styles.grid}>
          <HealthCard status={vitals.heartRate == null ? "Demonstração" : "Registrado"} title="Frequência cardíaca" value={vitals.heartRate ?? demoVitals.heartRate} unit="bpm" icon="heart-pulse" color={colors.primary} />
          <HealthCard status={vitals.glucose == null ? "Demonstração" : "Registrado"} title="Glicose" value={vitals.glucose ?? demoVitals.glucose} unit="mg/dL" icon="water-outline" color={colors.primary} />
          <HealthCard status={vitals.bloodPressure == null ? "Demonstração" : "Registrado"} title="Pressão arterial" value={vitals.bloodPressure ?? demoVitals.bloodPressure} unit="mmHg" icon="gauge" color={colors.primary} />
          <HealthCard title="Sono" value={vitals.sleep ?? demoVitals.sleep} unit="" icon="sleep" color={colors.primary} status={vitals.sleep == null ? "Demonstração" : "Registrado"} />
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
            <Text style={styles.sectionTitle}>Alertas e lembretes</Text>
          </View>
          <Text style={styles.link}>Ver todos</Text>
        </View>

        <View style={styles.alertGrid}>
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

        <Button
          title="Adicionar novo monitoramento"
          icon="chart-line"
          onPress={() => Alert.alert("Monitoramento", "Cadastro manual de sinais vitais pronto para expansao.")}
        />
        </View>
      </ScrollView>
      <BottomTab navigation={navigation} active="Monitoring" />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
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
    gap: 14
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
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  personCopy: {
    flex: 1,
    minWidth: 150
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
    borderColor: colors.primary,
    borderRadius: radius.md,
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  peopleMenu: {
    position: "absolute",
    top: 104,
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
    gap: 8
  },
  sectionTitle: {
    color: colors.text,
    fontFamily, fontSize: 20,
    fontWeight: "700"
  },
  updated: {
    color: colors.textMuted,
    fontFamily, fontSize: 13,
    fontWeight: "700"
  },
  link: {
    color: colors.primary,
    fontFamily, fontSize: 14,
    fontWeight: "700"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  alertGrid: {
    gap: 12
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  alertIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13
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
