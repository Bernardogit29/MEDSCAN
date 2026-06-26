import React, { useState } from "react";
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
import Card from "../components/Card";
import Header from "../components/Header";
import Input from "../components/Input";
import MedicalNotice from "../components/MedicalNotice";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { colors, radius, shadows } from "../constants/theme";
import {
  DEFAULT_MONITORED_PERSON_ID,
  MONITORED_PERSON_STORAGE_KEY,
  findMonitoredPerson
} from "../utils/monitoredPeople";
import { getStoredItem } from "../utils/storage";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const firstName = user?.name?.split(" ")[0] || "Usuario";

  async function pickImage(type) {
    setSelectedType(type);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissao necessaria", "Autorize o acesso a galeria para enviar imagens ou exames.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85
    });

    if (!result.canceled && result.assets?.length) {
      setSelectedImage(result.assets[0]);
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
      Alert.alert("Dados insuficientes", "Descreva sintomas ou selecione uma imagem para analise.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      const storedPersonId = await getStoredItem(MONITORED_PERSON_STORAGE_KEY);
      const monitoredPersonId = storedPersonId || DEFAULT_MONITORED_PERSON_ID;
      const monitoredPerson = findMonitoredPerson(monitoredPersonId);

      formData.append("symptoms", symptoms);
      formData.append("type", selectedImage ? selectedType : "symptoms");
      formData.append("monitoredPersonId", monitoredPerson.id);
      formData.append("monitoredPersonName", monitoredPerson.name);

      if (selectedImage) {
        await appendImageToFormData(formData, selectedImage);
      }

      const { data } = await api.post("/ai/analyze", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      navigation.navigate("Result", {
        analysis: data.analysis,
        imageUri: selectedImage?.uri
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Nao foi possivel chamar o backend agora. Verifique se a API esta ligada na porta 3000 e tente novamente.";

      Alert.alert("Analise nao concluida", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Header
            onNotificationsPress={() => navigation.navigate("Notifications")}
            title={`Ola, ${firstName}!`}
            subtitle="Como podemos ajudar voce hoje?"
          />

          <Card style={styles.hero}>
            <View style={styles.pill}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={colors.white} />
              <Text style={styles.pillText}>IA Medica</Text>
            </View>
            <Text style={styles.heroTitle}>Converse com a IA</Text>
            <Text style={styles.heroText}>
              Envie exames, imagens ou descreva seus sintomas e receba uma analise preliminar inteligente.
            </Text>
            <MaterialCommunityIcons name="medical-bag" size={120} color="rgba(255,255,255,0.12)" style={styles.heroIcon} />
          </Card>

          <Text style={styles.sectionTitle}>Enviar para analise</Text>
          <View style={styles.options}>
            <ActionRow
              title="Enviar exame"
              subtitle="Laboratoriais, sangue, urina, etc."
              icon="file-document"
              color={colors.primaryMedium}
              selected={selectedType === "exam"}
              onPress={() => pickImage("exam")}
            />
            <ActionRow
              title="Enviar imagem"
              subtitle="Pele, lesoes, radiografias, etc."
              icon="camera"
              color={colors.info}
              selected={selectedType === "image"}
              onPress={() => pickImage("image")}
            />
            <ActionRow
              title="Descrever sintomas"
              subtitle="Fale sobre o que voce esta sentindo"
              icon="message-text"
              color={colors.purple}
              selected={selectedType === "symptoms"}
              onPress={() => setSelectedType((currentType) => (currentType === "symptoms" ? null : "symptoms"))}
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

          {selectedType === "symptoms" ? (
            <Input
              label="Sintomas"
              icon="stethoscope"
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              placeholder="Descreva sintomas, duracao, intensidade e qualquer informacao relevante."
            />
          ) : null}

          <Button title="Analisar com IA" icon="brain" onPress={handleAnalyze} loading={loading} />

          <MedicalNotice title="Importante" />
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTab navigation={navigation} active="Home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  flex: {
    flex: 1
  },
  content: {
    padding: 22,
    paddingBottom: 130,
    gap: 18
  },
  hero: {
    backgroundColor: colors.primary,
    minHeight: 250,
    overflow: "hidden",
    gap: 16
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 7,
    alignItems: "center"
  },
  pillText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 14
  },
  heroTitle: {
    color: colors.white,
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: 0
  },
  heroText: {
    color: colors.white,
    fontSize: 18,
    lineHeight: 29,
    fontWeight: "600",
    maxWidth: "88%"
  },
  heroIcon: {
    position: "absolute",
    right: 16,
    top: 68
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  options: {
    gap: 13
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
    fontSize: 16,
    fontWeight: "900"
  },
  previewText: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 14,
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
