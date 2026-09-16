import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Header from "../components/Header";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadows } from "../constants/theme";
import { mockHistory } from "../utils/mockData";
import {
  DEFAULT_MONITORED_PERSON_ID,
  MONITORED_PERSON_STORAGE_KEY,
  getMonitoredPeople,
  findMonitoredPerson,
} from "../utils/monitoredPeople";
import { getStoredItem, setStoredItem } from "../utils/storage";

const fallbackHistoryByPerson = {
  maria: mockHistory.map((item) => ({
    ...item,
    monitoredPersonId: "maria",
    monitoredPersonName: "Maria Silva"
  })),
  joao: [
    {
      _id: "mock-joao-1",
      type: "symptoms",
      symptoms: "Pressao um pouco elevada e cansaco.",
      possibleCondition: "Acompanhamento de pressao arterial",
      riskLevel: "Moderado",
      confidence: 70,
      result: { details: "Registro demonstrativo do historico de Joao Silva." },
      monitoredPersonId: "joao",
      monitoredPersonName: "Joao Silva",
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  me: [
    {
      _id: "mock-me-1",
      type: "symptoms",
      symptoms: "Dor de cabeca leve apos treino.",
      possibleCondition: "Cefaleia leve",
      riskLevel: "Baixo",
      confidence: 74,
      result: { details: "Registro demonstrativo do seu historico." },
      monitoredPersonId: "me",
      monitoredPersonName: "Voce",
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function typeLabel(type) {
  const map = {
    exam: "Exame",
    image: "Imagem",
    symptoms: "Sintomas"
  };

  return map[type] || "Análise";
}

function riskColor(risk) {
  if (risk === "Alto") return colors.danger;
  if (risk === "Baixo") return colors.success;
  return colors.warning;
}

export default function HistoryScreen({ navigation }) {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState(() => getMonitoredPeople(user));
  const [selectedPersonId, setSelectedPersonId] = useState(DEFAULT_MONITORED_PERSON_ID);
  const selectedPerson = findMonitoredPerson(selectedPersonId, people);

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

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadHistory() {
        setLoading(true);
        try {
          const [profileResponse, historyResponse] = await Promise.all([
            api.get("/profile"),
            api.get(`/history?personId=${selectedPersonId}`)
          ]);
          const profile = profileResponse.data.profile || {};
          const loadedPeople = getMonitoredPeople(profileResponse.data.user || user, profile.relatives || []);
          if (mounted) {
            setPeople(loadedPeople);
            if (!loadedPeople.some((person) => person.id === selectedPersonId)) {
              setSelectedPersonId(DEFAULT_MONITORED_PERSON_ID);
              await setStoredItem(MONITORED_PERSON_STORAGE_KEY, DEFAULT_MONITORED_PERSON_ID);
            }
          }
          const { data } = historyResponse;
          if (mounted) setHistory(data);
        } catch (error) {
          if (mounted) setHistory(fallbackHistoryByPerson[selectedPersonId] || []);
        } finally {
          if (mounted) setLoading(false);
        }
      }

      loadHistory();

      return () => {
        mounted = false;
      };
    }, [selectedPersonId, user])
  );

  async function selectPerson(personId) {
    setSelectedPersonId(personId);
    await setStoredItem(MONITORED_PERSON_STORAGE_KEY, personId);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="Historico" subtitle={`Analises de ${selectedPerson.name}`} />

        <View style={styles.personTabs}>
          {people.map((person) => {
            const isActive = person.id === selectedPersonId;

            return (
              <TouchableOpacity
                key={person.id}
                style={[styles.personTab, isActive && styles.personTabActive]}
                activeOpacity={0.84}
                onPress={() => selectPerson(person.id)}
              >
                <MaterialCommunityIcons
                  name={person.icon}
                  size={18}
                  color={isActive ? colors.white : colors.primary}
                />
                <Text style={[styles.personTabText, isActive && styles.personTabTextActive]}>
                  {person.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Carregando histórico...</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {!history.length ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="file-search-outline" size={34} color={colors.primary} />
                <Text style={styles.emptyTitle}>Nenhuma analise para {selectedPerson.name}</Text>
                <Text style={styles.emptyText}>
                  As proximas analises feitas para esta pessoa aparecerao aqui.
                </Text>
              </View>
            ) : null}
            {history.map((item) => (
              <TouchableOpacity
                key={item._id}
                onPress={() => navigation.navigate("Result", { analysis: item })}
                activeOpacity={0.85}
                style={styles.item}
              >
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons
                    name={item.type === "symptoms" ? "message-text-outline" : "file-search-outline"}
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.copy}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.type}>{typeLabel(item.type)}</Text>
                    <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.summary} numberOfLines={2}>
                    {item.possibleCondition || item.result?.details || "Pré-análise orientativa registrada."}
                  </Text>
                  <View style={styles.riskLine}>
                    <View style={[styles.dot, { backgroundColor: riskColor(item.riskLevel) }]} />
                    <Text style={[styles.risk, { color: riskColor(item.riskLevel) }]}>
                      Risco {item.riskLevel || "Moderado"}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={28} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomTab navigation={navigation} active="History" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 22,
    paddingBottom: 130,
    gap: 16
  },
  loading: {
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  list: {
    gap: 14
  },
  personTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  personTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: colors.white
  },
  personTabActive: {
    backgroundColor: colors.primary
  },
  personTabText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900"
  },
  personTabTextActive: {
    color: colors.white
  },
  emptyState: {
    minHeight: 180,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
    gap: 8,
    ...shadows.card
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    textAlign: "center"
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1,
    gap: 6,
    minWidth: 0
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  type: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  riskLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  risk: {
    fontSize: 13,
    fontWeight: "900"
  }
});
