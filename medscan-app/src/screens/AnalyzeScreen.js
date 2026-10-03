import { useAppTheme } from "../context/ThemeContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import ActionRow from "../components/ActionRow";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import BrandHero from "../components/BrandHero";
import Input from "../components/Input";
import MedicalNotice from "../components/MedicalNotice";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { fontFamily, radius, shadows } from "../constants/theme";
import {
  DEFAULT_MONITORED_PERSON_ID,
  MONITORED_PERSON_STORAGE_KEY,
  getMonitoredPeople,
  findMonitoredPerson
} from "../utils/monitoredPeople";
import { getStoredItem, setStoredItem } from "../utils/storage";

import useAnalysisDraft from "../utils/useAnalysisDraft";
import { durableAttachment, releaseAttachment } from "../utils/draftStorage";

export default function AnalyzeScreen({ navigation, route }) {
  const { colors, styles } = useAppTheme(createStyles);
  const desktop = useDesktop();
  const { user, token, bootstrapping } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const needsLogin = !bootstrapping && (!user || !token || sessionExpired);
  const [loading, setLoading] = useState(false);
  const requestRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [people, setPeople] = useState(() => getMonitoredPeople(user));
  const [personId, setPersonId] = useState(route.params?.monitoredPersonId || DEFAULT_MONITORED_PERSON_ID);
  const [peopleReady, setPeopleReady] = useState(false);
  const owner = user?._id || user?.id;
  const draft = useAnalysisDraft(owner ? `analysis:${owner}:${personId}` : null, {
    symptoms: route.params?.initialSymptoms || "", selectedType: route.params?.type || "symptoms",
    selectedImage: null, attachmentType: "image", duration: "", intensity: "", context: "", status: "editing"
  });
  const { symptoms, selectedType, selectedImage, attachmentType, duration, intensity, context } = draft.value;
  const change = field => value => { if (!loading) draft.update({ [field]: value, status: "editing" }); };
  const setSymptoms = change("symptoms"), setSelectedType = change("selectedType");
  const setDuration = change("duration"), setIntensity = change("intensity"), setContext = change("context");
  useEffect(() => () => requestRef.current?.abort(), [owner]);

  useEffect(() => {
    let mounted = true;
    setPeopleReady(false);
    setErrorMessage("");
    setSessionExpired(false);
    if (bootstrapping || !user || !token) return;
    async function loadPeople() {
      try {
        const storedId = await getStoredItem(MONITORED_PERSON_STORAGE_KEY);
        const { data } = await api.get("/profile");
        const loaded = getMonitoredPeople(data.user || user, data.profile?.relatives || []);
        const requestedId = route.params?.monitoredPersonId || storedId || DEFAULT_MONITORED_PERSON_ID;
        if (!loaded.some(person => person.id === requestedId)) {
          throw new Error("A pessoa deste relato não está mais no prontuário. Volte e selecione uma pessoa antes de continuar.");
        }
        if (mounted) { setPeople(loaded); setPersonId(requestedId); setPeopleReady(true); }
      } catch (error) {
        if (!mounted) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          setSessionExpired(true);
        } else {
          setErrorMessage("Não foi possível carregar as pessoas do prontuário. Verifique sua conexão e reabra esta tela.");
        }
      }
    }
    loadPeople();
    return () => { mounted = false; };
  }, [user, token, bootstrapping, route.params?.monitoredPersonId, route.params?.revision]);
  async function pickImage(type) {
    if (loading || !draft.ready) return;
    setSelectedType(type);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso à galeria para enviar imagens ou exames.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      try {
        const asset = await durableAttachment(result.assets[0]);
        const saved = await draft.update({ selectedImage: asset, attachmentType: type, selectedType: type });
        if (saved) await releaseAttachment(selectedImage);
      } catch { setErrorMessage("Não foi possível guardar o anexo. Selecione-o novamente."); }
    }
  }

  async function appendImageToFormData(formData, image) {
    const filename = image.fileName || `medscan-${Date.now()}.jpg`;
    const mimeType = image.mimeType || "image/jpeg";

    if (Platform.OS === "web") {
      const response = await fetch(image.uri);
      const blob = await response.blob();
      formData.append("image", blob, filename);
      return;
    }

    formData.append("image", {
      uri: image.uri,
      name: filename,
      type: mimeType
    });
  }

  async function handleAnalyze() {
    if (!symptoms.trim() && !selectedImage) {
      setErrorMessage("Descreva os sintomas ou selecione uma imagem para análise.");
      return;
    }
    if (!peopleReady || !draft.ready || loading || requestRef.current) return;

    setErrorMessage("");
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    await draft.update({ status: "submitting" });

    try {
      const formData = new FormData();
      const monitoredPerson = findMonitoredPerson(personId, people);
      await setStoredItem(MONITORED_PERSON_STORAGE_KEY, monitoredPerson.id);

      formData.append("symptoms", [symptoms.trim(), duration && `Duração: ${duration}`, intensity && `Intensidade: ${intensity}`, context && `Contexto adicional: ${context}`].filter(Boolean).join("\n"));
      formData.append("type", selectedImage ? attachmentType : "symptoms");
      formData.append("monitoredPersonId", monitoredPerson.id);
      formData.append("monitoredPersonName", monitoredPerson.name);

      if (selectedImage) {
        await appendImageToFormData(formData, selectedImage);
      }

      const { data } = await api.post("/ai/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        },
        signal: controller.signal,
        timeout: 150000
      });

      if (!data.analysis?._id) throw new Error("A resposta recebida não confirmou o registro da análise.");
      const cleared = await draft.clear();
      if (cleared) await releaseAttachment(selectedImage).catch(() => {});
      if (navigation.isFocused()) navigation.navigate("Result", {
        analysis: data.analysis,
        imageUri: null
      });
    } catch (error) {
      await draft.update({ status: "interrupted" });
      if (error.code === "ERR_CANCELED") return;
      if (error.response?.status === 401 || error.response?.status === 403) {
        setSessionExpired(true);
        setPeopleReady(false);
        return;
      }
      const message =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT"
          ? "A analise demorou mais que o esperado. Aguarde alguns segundos e tente novamente."
          : "Nao foi possivel concluir a analise agora. Verifique sua conexao e tente novamente.");

      setErrorMessage(message);
    } finally {
      requestRef.current = null;
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, desktop && desktopPage]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.content, desktop && desktopContent]} showsVerticalScrollIndicator={false}>
          <BrandHero
            title="Vamos entender melhor"
            subtitle="Conte o que está acontecendo com você."
            badge="Seu assistente de saúde"
            onBack={() => navigation.goBack()}
            onNotifications={() => navigation.navigate("Notifications")}
          />
          <View style={styles.body}>
          <Text style={styles.previewText} accessibilityLiveRegion="polite">{!draft.ready ? "Recuperando rascunho…" : draft.notice || (owner ? "Seu rascunho fica neste dispositivo, separado por pessoa e conta." : "Entre para salvar o rascunho. Sem login, o texto permanece apenas nesta tela.")}</Text>
          {draft.value.status === "interrupted" ? <Text style={styles.previewText}>A tentativa anterior não foi confirmada. Confira o prontuário antes de enviar novamente para evitar duplicar o relato. Seus campos e anexo foram mantidos.</Text> : null}
          {draft.ready && !loading && (symptoms || selectedImage || duration || context || intensity) ? <Button title="Descartar rascunho" variant="outline" onPress={async () => { if (await draft.clear()) await releaseAttachment(selectedImage).catch(() => {}); }} /> : null}
          <View pointerEvents={loading || !draft.ready ? "none" : "auto"} style={{ gap: 17 }}>
          <Text style={styles.fieldLabel}>Para quem é esta orientação?</Text>
          <View style={styles.intensityRow}>
            {people.map(person => <TouchableOpacity key={person.id} accessibilityRole="button" accessibilityState={{ selected: person.id === personId }} disabled={loading || Boolean(route.params?.monitoredPersonId)} onPress={() => setPersonId(person.id)} style={[styles.intensityChip, person.id === personId && styles.intensityActive]}><Text style={{ fontFamily, color: person.id === personId ? colors.white : colors.primary }}>{person.name}</Text></TouchableOpacity>)}
          </View>

          <Text style={styles.sectionTitle}>Enviar para análise</Text>
          <View style={styles.options}>
            <ActionRow
              title="Enviar exame"
              subtitle="Laboratoriais, sangue, urina, etc."
              icon="file-document-outline"
              color={colors.primary}
              selected={selectedType === "exam"}
              onPress={() => pickImage("exam")}
            />
            <ActionRow
              title="Enviar imagem"
              subtitle="Pele, lesões, radiografias, etc."
              icon="camera-outline"
              color={colors.primary}
              selected={selectedType === "image"}
              onPress={() => pickImage("image")}
            />
          </View>

          {selectedImage ? (
            <View style={styles.previewRow}>
              <Image source={{ uri: selectedImage.uri }} style={styles.preview} />
              <View style={styles.previewCopy}>
                <Text style={styles.previewTitle}>Arquivo selecionado</Text>
                <Text style={styles.previewText} numberOfLines={2}>
                  {selectedImage.fileName || "Imagem pronta para analise"}
                </Text>
              </View>
              <TouchableOpacity onPress={async () => { if (await draft.update({ selectedImage: null })) await releaseAttachment(selectedImage).catch(() => {}); }} style={styles.removeButton}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : null}

          <Input
              editable={!loading && draft.ready}
              label="O que você está sentindo?"
              icon="stethoscope"
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Descreva sintomas, duração, intensidade e qualquer informação relevante."
          />

          <Input editable={!loading && draft.ready} label="Há quanto tempo? (opcional)" value={duration} onChangeText={setDuration} placeholder="Ex.: começou ontem, está piorando hoje" />
          <Text style={styles.fieldLabel}>Como está a intensidade? (opcional)</Text>
          <View style={styles.intensityRow}>
            {["Leve", "Moderada", "Intensa"].map(value => (
              <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: intensity === value }} onPress={() => setIntensity(intensity === value ? "" : value)} style={[styles.intensityChip, intensity === value && styles.intensityActive]}>
                <Text style={{ color: intensity === value ? colors.white : colors.primary }}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input editable={!loading && draft.ready} label="Algo mais que precisamos saber? (opcional)" multiline value={context} onChangeText={setContext} placeholder="Idade da pessoa, doenças, medicamentos, alergias, gestação ou o que melhora/piora." />
          </View>
          {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
          {needsLogin ? (
            <View style={styles.loginNotice}>
              <Text style={styles.loginTitle}>{sessionExpired ? "Entre novamente para continuar" : "Entre para receber sua orientação"}</Text>
              <Text style={styles.loginCopy}>Seu relato continuará aqui depois do login.</Text>
              <Button title="Entrar na minha conta" onPress={() => navigation.navigate("Login", { returnToPrevious: true })} />
            </View>
          ) : <Button title={draft.value.status === "interrupted" ? "Tentar novamente" : "Receber orientação"} icon="creation" onPress={handleAnalyze} loading={loading || bootstrapping} disabled={!peopleReady || !draft.ready} />}
          {loading ? <Text style={styles.previewText}>Estamos preparando sua orientação. Se a IA estiver ocupada, tentaremos novamente automaticamente. Isso pode levar até dois minutos.</Text> : null}

          <MedicalNotice title="Importante" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTab navigation={navigation} active="Analyze" />
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  loginNotice: { backgroundColor: colors.primaryLight, borderRadius: 20, padding: 18, gap: 12 },
  loginTitle: { color: colors.primary, fontFamily, fontSize: 16, fontWeight: "600" },
  loginCopy: { color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 },
  fieldLabel: { color: colors.text, fontFamily, fontSize: 14, fontWeight: "600" },
  intensityRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  intensityChip: { padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  intensityActive: { backgroundColor: colors.hero },
  error: { color: colors.danger, lineHeight: 22 },
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingBottom: 130,
    gap: 0
  },
  body: { padding: 20, gap: 17 },
  sectionTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0
  },
  options: {
    gap: 10
  },
  previewRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card
  },
  preview: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.primaryLight
  },
  previewCopy: {
    flex: 1,
    minWidth: 0
  },
  previewTitle: {
    color: colors.text,
    fontFamily, fontSize: 16,
    fontWeight: "700"
  },
  previewText: {
    marginTop: 3,
    color: colors.textMuted,
    fontFamily, fontSize: 14,
    fontWeight: "600"
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  }
});
