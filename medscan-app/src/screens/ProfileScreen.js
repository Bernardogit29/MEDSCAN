import React, { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../constants/theme";

const settings = [
  { label: "Privacidade e Segurança", icon: "shield-lock-outline" },
  { label: "Notificações", icon: "bell-outline" },
  { label: "Preferências do App", icon: "tune-variant" },
  { label: "Ajuda e Suporte", icon: "help-circle-outline" }
];

export default function ProfileScreen({ navigation, route }) {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    user,
    profile: {
      verified: true,
      relatives: []
    }
  });
  const [familyModalVisible, setFamilyModalVisible] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [familyAge, setFamilyAge] = useState("");
  const [savingFamily, setSavingFamily] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const { data } = await api.get("/profile");
        if (mounted) setProfileData(data);
      } catch (error) {
        if (mounted) {
          setProfileData({
            user: user || { name: "Usuário MEDSCAN", email: "usuario@medscan.com" },
            profile: { verified: true, relatives: [] }
          });
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (route.params?.openFamilyForm) {
      setFamilyModalVisible(true);
      navigation.setParams({ openFamilyForm: false });
    }
  }, [navigation, route.params?.openFamilyForm]);

  async function addFamilyMember() {
    const name = familyName.trim();
    const age = Number(familyAge);

    if (!name) {
      Alert.alert("Dados incompletos", "Informe o nome do familiar.");
      return;
    }

    if (familyAge && (!Number.isInteger(age) || age < 0 || age > 120)) {
      Alert.alert("Idade inválida", "Informe uma idade entre 0 e 120 anos.");
      return;
    }

    const relative = {
      id: `relative-${Date.now()}`,
      name,
      age: familyAge ? age : null,
      relation: "Familiar monitorado",
      status: "Estavel",
      icon: "account-heart",
      vitals: {
        heartRate: 82,
        glucose: 98,
        bloodPressure: "120/80",
        sleep: "7h 30m"
      }
    };

    setSavingFamily(true);
    try {
      const relatives = [...(profileData.profile?.relatives || []), relative];
      const { data } = await api.put("/profile", { relatives });
      setProfileData(data);
      setFamilyName("");
      setFamilyAge("");
      setFamilyModalVisible(false);
      Alert.alert("Familiar adicionado", `${name} agora aparece no monitoramento.`);
    } catch (error) {
      Alert.alert("Não foi possível salvar", "Verifique a conexão com a API e tente novamente.");
    } finally {
      setSavingFamily(false);
    }
  }

  function handleLogout() {
    Alert.alert("Sair da conta", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        }
      }
    ]);
  }

  const currentUser = profileData.user || user || {};
  const profile = profileData.profile || {};

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header
          title="Perfil"
          subtitle="Gerencie seus dados e preferências"
          onNotificationsPress={() => navigation.navigate("Notifications")}
        />

        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account" size={54} color={colors.primary} />
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{currentUser.name || "Usuário MEDSCAN"}</Text>
            <Text style={styles.email}>{currentUser.email || "usuario@medscan.com"}</Text>
            {currentUser.age !== undefined && currentUser.age !== null ? (
              <Text style={styles.age}>{currentUser.age} anos</Text>
            ) : null}
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={18} color={colors.success} />
              <Text style={styles.verifiedText}>
                {profile.verified ? "Conta verificada" : "Conta não verificada"}
              </Text>
            </View>
          </View>
        </Card>

        <Card style={styles.deviceSummary}>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="devices" size={30} color={colors.primary} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryTitle}>Dispositivos de saúde conectados</Text>
            <Text style={styles.summaryText}>4 aparelhos ativos para monitoramento preventivo.</Text>
          </View>
        </Card>

        <View style={styles.buttonGroup}>
          <Button
            title="Adicionar dispositivo"
            icon="plus-circle-outline"
            variant="outline"
            onPress={() => Alert.alert("Dispositivo", "Fluxo de conexão preparado para a próxima etapa.")}
          />
          <Button
            title="Adicionar familiar para monitoramento"
            icon="account-heart-outline"
            variant="soft"
            onPress={() => setFamilyModalVisible(true)}
          />
        </View>

        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.settingsList}>
          {settings.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.settingRow}
              activeOpacity={0.84}
              onPress={item.label === "Notificações" ? () => navigation.navigate("Notifications") : undefined}
            >
              <View style={styles.settingIcon}>
                <MaterialCommunityIcons name={item.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>{item.label}</Text>
              <MaterialCommunityIcons name="chevron-right" size={25} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.logoutRow} activeOpacity={0.84} onPress={handleLogout}>
            <View style={styles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={24} color={colors.danger} />
            </View>
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={familyModalVisible} transparent animationType="slide" onRequestClose={() => setFamilyModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Adicionar familiar</Text>
            <Text style={styles.modalSubtitle}>Cadastre uma pessoa para acompanhar no monitoramento.</Text>
            <TextInput
              value={familyName}
              onChangeText={setFamilyName}
              placeholder="Nome completo"
              placeholderTextColor={colors.textMuted}
              style={styles.modalInput}
            />
            <TextInput
              value={familyAge}
              onChangeText={setFamilyAge}
              placeholder="Idade (opcional)"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Button title="Cancelar" variant="outline" onPress={() => setFamilyModalVisible(false)} />
              <Button title="Salvar familiar" onPress={addFamilyMember} loading={savingFamily} />
            </View>
          </View>
        </View>
      </Modal>
      <BottomTab navigation={navigation} active="Profile" />
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
    gap: 18
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  profileCopy: {
    flex: 1,
    minWidth: 0
  },
  name: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900"
  },
  email: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4
  },
  age: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3
  },
  verifiedBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-start",
    backgroundColor: "#DCFCE7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  verifiedText: {
    color: "#11762D",
    fontWeight: "900",
    fontSize: 13
  },
  deviceSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  summaryIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  summaryCopy: {
    flex: 1
  },
  summaryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  summaryText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 4
  },
  buttonGroup: {
    gap: 12
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 4
  },
  settingsList: {
    gap: 12
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)"
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    gap: 14
  },
  modalTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: "900"
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20
  },
  modalInput: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 16
  },
  modalActions: {
    flexDirection: "row",
    gap: 10
  },
  settingRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13
  },
  settingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center"
  },
  settingLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  logoutRow: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FFE4E6",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13
  },
  logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center"
  },
  logoutText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900"
  }
});
