import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import React, { useEffect, useState } from "react";
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
import { fontFamily, colors, radius, shadows } from "../constants/theme";
import {
  DEFAULT_MONITORED_PERSON_ID,
  MONITORED_PERSON_STORAGE_KEY,
  getMonitoredPeople,
  findMonitoredPerson
} from "../utils/monitoredPeople";
import { getStoredItem, setStoredItem } from "../utils/storage";

export default function AnalyzeScreen({ navigation, route }) {
  const desktop = useDesktop();
  const { user, token, bootstrapping } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const needsLogin = !bootstrapping && (!user || !token || sessionExpired);
  const [symptoms, setSymptoms] = useState(route.params?.initialSymptoms || "");
  const [selectedType, setSelectedType] = useState(route.params?.type || "symptoms");
  const [selectedImage, setSelectedImage] = useState(null);
  const [attachmentType, setAttachmentType] = useState("image");
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("");
  const [context, setContext] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [people, setPeople] = useState(() => getMonitoredPeople(user));
  const [personId, setPersonId] = useState(route.params?.monitoredPersonId || DEFAULT_MONITORED_PERSON_ID);
  const [peopleReady, setPeopleReady] = useState(false);
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
  useEffect(() => {
    setSymptoms(route.params?.initialSymptoms || "");
    setSelectedType(route.params?.type || "symptoms");
    setSelectedImage(null);
    setDuration("");
    setIntensity("");
    setContext("");
    setErrorMessage("");
  }, [route.params?.revision, route.params?.initialSymptoms, route.params?.type]);

  async function pickImage(type) {
    setSelectedType(type);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso a galeria para enviar imagens ou exames.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      setSelectedImage(result.assets[0]);
      setAttachmentType(type);
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
    if (!peopleReady || loading) return;

    setErrorMessage("");
    setLoading(true);

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
        timeout: 150000
      });

      navigation.navigate("Result", {
        analysis: data.analysis,
        imageUri: selectedImage?.uri
      });
    } catch (error) {
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
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeButton}>
                <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ) : null}

          <Input
              label="O que você está sentindo?"
              icon="stethoscope"
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Descreva sintomas, duracao, intensidade e qualquer informacao relevante."
          />

          <Input label="Há quanto tempo? (opcional)" value={duration} onChangeText={setDuration} placeholder="Ex.: começou ontem, está piorando hoje" />
          <Text style={styles.fieldLabel}>Como está a intensidade? (opcional)</Text>
          <View style={styles.intensityRow}>
            {["Leve", "Moderada", "Intensa"].map(value => (
              <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{ selected: intensity === value }} onPress={() => setIntensity(intensity === value ? "" : value)} style={[styles.intensityChip, intensity === value && styles.intensityActive]}>
                <Text style={{ color: intensity === value ? colors.white : colors.primary }}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Input label="Algo mais que precisamos saber? (opcional)" multiline value={context} onChangeText={setContext} placeholder="Idade da pessoa, doenças, medicamentos, alergias, gestação ou o que melhora/piora." />
          {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
          {needsLogin ? (
            <View style={styles.loginNotice}>
              <Text style={styles.loginTitle}>{sessionExpired ? "Entre novamente para continuar" : "Entre para receber sua orientação"}</Text>
              <Text style={styles.loginCopy}>Seu relato continuará aqui depois do login.</Text>
              <Button title="Entrar na minha conta" onPress={() => navigation.navigate("Login", { returnToPrevious: true })} />
            </View>
          ) : <Button title="Receber orientação" icon="creation" onPress={handleAnalyze} loading={loading || bootstrapping} disabled={!peopleReady} />}
          {loading ? <Text style={styles.previewText}>Estamos preparando sua orientação. Se a IA estiver ocupada, tentaremos novamente automaticamente. Isso pode levar até dois minutos.</Text> : null}

          <MedicalNotice title="Importante" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTab navigation={navigation} active="Analyze" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loginNotice: { backgroundColor: colors.primaryLight, borderRadius: 20, padding: 18, gap: 12 },
  loginTitle: { color: colors.primary, fontFamily, fontSize: 16, fontWeight: "600" },
  loginCopy: { color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 },
  fieldLabel: { color: colors.text, fontFamily, fontSize: 14, fontWeight: "600" },
  intensityRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  intensityChip: { padding: 13, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white },
  intensityActive: { backgroundColor: colors.primary },
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
    backgroundColor: colors.white,
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
    backgroundColor: "#F1F5F9"
  }
});
