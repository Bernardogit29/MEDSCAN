import React, { useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";
import Card from "../components/Card";
import Header from "../components/Header";
import MedicalNotice from "../components/MedicalNotice";
import { API_ORIGIN } from "../api/client";
import { colors, radius } from "../constants/theme";
import { mockAnalysis } from "../utils/mockData";

const demoHospitals = [
  "Hospital Sao Lucas",
  "Hospital Santa Helena",
  "Hospital Vida Plena",
  "Pronto Atendimento Central",
  "Clinica Medica Sao Jose"
];

function riskStyle(risk) {
  if (risk === "Alto") {
    return { color: colors.danger, background: "#FEE2E2" };
  }
  if (risk === "Baixo") {
    return { color: colors.success, background: "#DCFCE7" };
  }
  return { color: colors.warning, background: colors.warningLight };
}

function buildAnalysisSections(analysis, details, conditionTitle) {
  const report = analysis.result?.report || analysis.report;

  if (report?.summary) {
    const reportSections = [
      {
        title: "Resumo clinico",
        text: report.summary
      },
      {
        title: "Achados relevantes",
        items: report.relevantFindings
      },
      {
        title: "Possiveis explicacoes",
        items: report.possibleExplanations
      },
      {
        title: "Sinais de alerta",
        description: "Procure atendimento medico com prioridade se algum destes sinais aparecer:",
        items: report.redFlags
      },
      {
        title: "Proximos passos",
        items: report.nextSteps
      },
      {
        title: "Perguntas para levar ao medico",
        items: report.questionsForClinician
      }
    ].filter((section) => section.text || section.items?.length);

    if (reportSections.length) {
      return reportSections;
    }
  }

  const condition = analysis.possibleCondition || "uma condicao ainda em avaliacao";
  const risk = analysis.riskLevel || "Moderado";
  const confidence = analysis.confidence || 0;
  const symptoms = analysis.symptoms?.trim();
  const visualFindings = analysis.result?.visualFindings || analysis.visualFindings || "";
  const cleanedDetails = details
    ? details
        .replace(/esta analise e apenas orientativa.*$/i, "")
        .replace(/esta an[aá]lise .*?consulta m[eé]dica\.?$/i, "")
        .trim()
    : "";
  const normalizedCondition = conditionTitle.toLowerCase();
  const isAbdominal = normalizedCondition.includes("abdominal");
  const isMuscleOrJoint =
    normalizedCondition.includes("tornozelo") ||
    normalizedCondition.includes("muscular") ||
    normalizedCondition.includes("articular");

  const sections = [
    {
      title: "Entendimento inicial",
      text:
        cleanedDetails ||
        `A IA relacionou os dados enviados a ${condition.toLowerCase()}, com risco ${risk.toLowerCase()} e confianca estimada de ${confidence}%.`
    },
    {
      title: "O que foi considerado",
      text: symptoms || "Descricao dos sintomas, exames ou imagem enviada para analise."
    }
  ];

  if (visualFindings) {
    sections.push({
      title: "Observacoes da imagem",
      text: visualFindings
    });
  }

  sections.push(
    {
      title: "O que voce pode fazer agora",
      items: isMuscleOrJoint
        ? [
            { label: "Repouse", text: "evite forcar o tornozelo e reduza atividades que aumentem a dor." },
            { label: "Eleve a perna", text: "deixe o pe elevado quando possivel para ajudar no inchaco." },
            { label: "Compressa fria", text: "use por 15 a 20 minutos, algumas vezes ao dia, se houver dor ou inchaco." },
            { label: "Observe a evolucao", text: "acompanhe se a dor melhora, piora ou limita o apoio do pe." }
          ]
        : isAbdominal
          ? [
              { label: "Hidrate-se", text: "beba agua em pequenos goles e evite bebidas alcoolicas ou refrigerantes." },
              { label: "Alimentacao leve", text: "prefira sopas, frutas, torradas, arroz, legumes e carnes magras." },
              { label: "Evite irritantes", text: "reduza frituras, alimentos muito gordurosos, feijao e comidas que aumentem gases." },
              { label: "Compressa morna", text: "uma bolsa morna na barriga pode aliviar colicas e tensao muscular." }
            ]
          : [
              { label: "Observe a evolucao", text: "acompanhe intensidade, duracao e novos sintomas." },
              { label: "Mantenha repouso", text: "evite esforcos se houver mal-estar ou dor persistente." },
              { label: "Registre mudancas", text: "anote horarios, gatilhos e o que melhora ou piora o quadro." }
            ]
    },
    {
      title: "Sinais de alerta",
      description: "Procure atendimento medico com prioridade se aparecer qualquer um destes sinais:",
      items: isMuscleOrJoint
        ? [
            { text: "dor intensa ou que piora progressivamente." },
            { text: "inchaço importante, roxidao ou deformidade." },
            { text: "dificuldade para apoiar o pe ou caminhar." },
            { text: "formigamento, perda de sensibilidade ou pe frio/palido." }
          ]
        : isAbdominal
          ? [
              { text: "dor muito forte, insuportavel ou que aumenta progressivamente." },
              { text: "febre alta ou persistente." },
              { text: "vomitos repetidos ou dificuldade para manter liquidos." },
              { text: "sangue nas fezes ou vomito com sangue." },
              { text: "barriga muito rigida, inchada ou dolorida ao toque." },
              { text: "falta de ar, palidez intensa, desmaio ou tontura forte." }
            ]
          : [
              { text: "piora rapida dos sintomas." },
              { text: "dor intensa, falta de ar, desmaio ou confusao." },
              { text: "sintomas que nao melhoram nos proximos dias." }
            ]
    },
    {
      title: "Proximo passo",
      text: `Se o sintoma continuar ou voltar com frequencia, consulte um profissional de saude. Risco estimado: ${risk.toLowerCase()} | Confianca da IA: ${confidence}%.`
    }
  );

  return sections;
}

function shortCondition(condition = "Em avaliacao") {
  const normalized = condition.toLowerCase();

  if (
    normalized.includes("tornozelo") ||
    normalized.includes("joelho") ||
    normalized.includes("ombro") ||
    normalized.includes("punho") ||
    normalized.includes("articular") ||
    normalized.includes("muscular")
  ) {
    return normalized.includes("tornozelo") ? "Dor no tornozelo" : "Dor muscular ou articular";
  }
  if (normalized.includes("abdominal") || normalized.includes("barriga") || normalized.includes("gastro")) {
    return "Dor abdominal";
  }
  if (normalized.includes("respir") || normalized.includes("tosse") || normalized.includes("gripe")) {
    return "Sintomas respiratorios";
  }
  if (normalized.includes("cefaleia") || normalized.includes("cabeca") || normalized.includes("tontura")) {
    return "Dor de cabeca e tontura";
  }
  if (normalized.includes("pele") || normalized.includes("dermat") || normalized.includes("nevo")) {
    return "Alteracao na pele";
  }
  if (normalized.includes("card") || normalized.includes("peito") || normalized.includes("pressao")) {
    return "Sinal cardiovascular";
  }

  return condition
    .split(/[.;,]/)[0]
    .replace(/\s+(possivelmente|provavelmente|relacionad[ao].*)$/i, "")
    .trim();
}

function buildRecommendation(analysis, conditionTitle) {
  const risk = analysis.riskLevel || "Moderado";
  const context = [
    conditionTitle,
    analysis.possibleCondition,
    analysis.symptoms,
    analysis.result?.details,
    analysis.details
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (
    context.includes("tornozelo") ||
    context.includes("joelho") ||
    context.includes("ombro") ||
    context.includes("punho") ||
    context.includes("articular") ||
    context.includes("muscular") ||
    context.includes("entorse") ||
    context.includes("incha")
  ) {
    return {
      title: "Repouse a regiao e procure avaliacao se a dor no tornozelo continuar ou piorar.",
      detail:
        "Busque atendimento antes se houver inchaço importante, deformidade, dor intensa, dificuldade para apoiar o pe ou perda de sensibilidade."
    };
  }

  if (context.includes("abdominal") || context.includes("barriga") || context.includes("gastro")) {
    return {
      title: "Procure avaliacao medica nas proximas 24 horas se a dor continuar ou piorar.",
      detail:
        "Va ao atendimento imediato se houver febre, vomitos persistentes, sangue nas fezes, barriga rigida, falta de ar, desmaio ou dor intensa."
    };
  }

  if (risk === "Alto") {
    return {
      title: "Procure atendimento medico com prioridade.",
      detail: "Busque ajuda imediata se houver piora rapida, dor intensa, falta de ar, desmaio ou confusao."
    };
  }

  return {
    title: "Acompanhe a evolucao e procure avaliacao se os sintomas persistirem.",
    detail: "Busque atendimento antes se houver piora rapida, dor forte, limitacao importante ou novos sinais de alerta."
  };
}

export default function ResultScreen({ navigation, route }) {
  const [hospitals, setHospitals] = useState([]);
  const analysis = route.params?.analysis || mockAnalysis;
  const imageUri = route.params?.imageUri;
  const risk = riskStyle(analysis.riskLevel);
  const details = analysis.result?.details || analysis.details || mockAnalysis.result.details;
  const conditionTitle = shortCondition(analysis.possibleCondition);
  const summarySections = buildAnalysisSections(analysis, details, conditionTitle);
  const recommendation = buildRecommendation(analysis, conditionTitle);

  const remoteImage = useMemo(() => {
    if (!analysis.imageUrl) return null;
    if (analysis.imageUrl.startsWith("http")) return analysis.imageUrl;
    return `${API_ORIGIN}${analysis.imageUrl}`;
  }, [analysis.imageUrl]);

  const imageSource = imageUri || remoteImage;

  function showDemoHospitals() {
    setHospitals((currentHospitals) => (currentHospitals.length ? [] : demoHospitals));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header
          title="Resultado da analise"
          subtitle="Analise concluida com IA"
          onBack={() => navigation.goBack()}
        />

        <View style={styles.disclaimerBox}>
          <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
          <Text style={styles.disclaimerText}>
            Esta analise foi realizada com base nos dados enviados e nao substitui uma consulta medica.
          </Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Resumo da analise</Text>
          <View style={[styles.summaryRow, !imageSource && styles.summaryRowNoImage]}>
            {imageSource ? (
              <Image source={{ uri: imageSource }} style={styles.analysisImage} />
            ) : null}
            <View style={styles.summaryInfo}>
              <Text style={styles.label}>Possivel condicao</Text>
              <Text style={styles.condition}>{conditionTitle}</Text>
              <Text style={styles.label}>Nivel de risco</Text>
              <View style={[styles.riskBadge, { backgroundColor: risk.background }]}>
                <View style={[styles.riskDot, { backgroundColor: risk.color }]} />
                <Text style={[styles.riskText, { color: risk.color }]}>{analysis.riskLevel || "Moderado"}</Text>
              </View>
              <Text style={styles.label}>Confianca da IA</Text>
              <Text style={styles.confidence}>{analysis.confidence || 0}%</Text>
            </View>
          </View>

          <View style={styles.summaryTextBox}>
            <Text style={styles.summaryTextTitle}>Resumo interpretativo</Text>
            {summarySections.map((section) => (
              <View key={section.title} style={styles.summarySection}>
                <Text style={styles.summarySectionTitle}>{section.title}</Text>
                {section.description ? <Text style={styles.summaryText}>{section.description}</Text> : null}
                {section.text ? <Text style={styles.summaryText}>{section.text}</Text> : null}
                {section.items?.map((item) => (
                  <View key={`${section.title}-${item.label || item.text}`} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>
                      {item.label ? <Text style={styles.bulletStrong}>{item.label}: </Text> : null}
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Recomendacao</Text>
          <View style={styles.recommendationRow}>
            <View style={styles.alertCircle}>
              <MaterialCommunityIcons name="alert-outline" size={44} color={colors.danger} />
            </View>
            <View style={styles.recommendationCopy}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={styles.recommendationText}>{recommendation.detail}</Text>
            </View>
          </View>
          <Button
            title="Hospitais perto da sua localizacao"
            icon="hospital-building"
            onPress={showDemoHospitals}
          />
          {hospitals.length ? (
            <View style={styles.hospitalList}>
              {hospitals.map((hospitalName) => (
                <Text key={hospitalName} style={styles.hospitalName}>
                  {hospitalName}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>

        <MedicalNotice />
      </ScrollView>
      <BottomTab navigation={navigation} active="Home" />
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
    gap: 20
  },
  disclaimerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  disclaimerText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  summaryCard: {
    gap: 18
  },
  cardTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 14
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16
  },
  summaryRowNoImage: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14
  },
  analysisImage: {
    width: 142,
    height: 142,
    borderRadius: 18,
    backgroundColor: colors.primaryLight
  },
  summaryInfo: {
    flex: 1,
    gap: 7,
    minWidth: 0
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2
  },
  condition: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  riskBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  riskDot: {
    width: 11,
    height: 11,
    borderRadius: 6
  },
  riskText: {
    fontSize: 15,
    fontWeight: "900"
  },
  confidence: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  summaryTextBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 18
  },
  summaryTextTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  summarySection: {
    gap: 8
  },
  summarySectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23
  },
  summaryText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  bulletDot: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900"
  },
  bulletText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600"
  },
  bulletStrong: {
    fontWeight: "900"
  },
  recommendationRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 18
  },
  alertCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center"
  },
  recommendationCopy: {
    flex: 1,
    gap: 7
  },
  recommendationTitle: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 22
  },
  recommendationText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600"
  },
  hospitalList: {
    marginTop: 14,
    borderRadius: radius.md,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 10
  },
  hospitalName: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "800"
  }
});
