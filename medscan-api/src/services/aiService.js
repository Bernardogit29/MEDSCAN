const fs = require("fs/promises");
const axios = require("axios");

const OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-5.4-mini";
const MAX_INLINE_IMAGE_BYTES = 8 * 1024 * 1024;

const medicalDisclaimer =
  "Esta analise e apenas orientativa e nao substitui avaliacao medica presencial.";

const fallbackRules = [
  {
    keywords: ["pele", "mancha", "pinta", "lesao", "coceira", "vermelhid"],
    result: {
      possibleCondition: "Alteracao dermatologica a avaliar",
      riskLevel: "Moderado",
      confidence: 72,
      recommendation: "Consulte um dermatologista para avaliar a lesao com seguranca.",
      details:
        "Os sintomas informados sugerem uma alteracao na pele que precisa ser acompanhada. Observe crescimento, mudanca de cor, sangramento, dor ou secrecao."
    }
  },
  {
    keywords: ["febre", "tosse", "garganta", "coriza", "espirro", "resfriado"],
    result: {
      possibleCondition: "Quadro respiratorio ou infeccioso leve",
      riskLevel: "Baixo",
      confidence: 69,
      recommendation: "Hidrate-se, acompanhe a temperatura e procure atendimento se houver piora.",
      details:
        "Os sintomas lembram um quadro respiratorio comum. Febre persistente, falta de ar, dor no peito ou piora rapida exigem avaliacao medica."
    }
  },
  {
    keywords: ["barriga", "abdominal", "diarreia", "vomitando", "estomago", "enjoo"],
    result: {
      possibleCondition: "Desconforto gastrointestinal",
      riskLevel: "Baixo",
      confidence: 68,
      recommendation: "Mantenha hidratacao e procure atendimento se houver dor forte, sangue ou sinais de desidratacao.",
      details:
        "Os sintomas podem estar ligados a alimentacao, gastrite, virose ou irritacao intestinal. Acompanhamento e importante se os sintomas persistirem."
    }
  },
  {
    keywords: ["cabeca", "enxaqueca", "tontura", "nausea", "vomito"],
    result: {
      possibleCondition: "Cefaleia ou mal-estar neurologico inespecifico",
      riskLevel: "Moderado",
      confidence: 66,
      recommendation: "Procure avaliacao se a dor for intensa, diferente do habitual ou acompanhada de sinais neurologicos.",
      details:
        "Dor de cabeca e tontura podem ter varias causas, como estresse, desidratacao, alteracoes de pressao ou infeccoes. Fraqueza, confusao, desmaio ou alteracao visual sao sinais de alerta."
    }
  },
  {
    keywords: ["pressao", "peito", "palpitacao", "coracao", "falta de ar"],
    result: {
      possibleCondition: "Sinal cardiovascular que precisa de atencao",
      riskLevel: "Alto",
      confidence: 74,
      recommendation: "Procure atendimento medico com prioridade, principalmente se houver dor no peito ou falta de ar.",
      details:
        "Os sintomas relatados podem envolver pressao arterial, ritmo cardiaco ou circulacao. Dor no peito, suor frio, desmaio ou falta de ar devem ser avaliados imediatamente."
    }
  }
];

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function buildLocalFallback(symptoms = "", image) {
  const normalizedSymptoms = normalizeText(symptoms);
  const match = fallbackRules.find((rule) =>
    rule.keywords.some((keyword) => normalizedSymptoms.includes(keyword))
  );

  const baseResult =
    match?.result || {
      possibleCondition: image ? "Imagem enviada para triagem" : "Sintomas inespecificos para triagem",
      riskLevel: "Moderado",
      confidence: 61,
      recommendation: "Acompanhe a evolucao dos sintomas e procure um profissional de saude se houver piora.",
      details:
        "As informacoes enviadas nao indicam um padrao unico. Uma avaliacao presencial pode considerar historico, exame fisico e outros dados clinicos."
    };

  return {
    ...baseResult,
    details: `${baseResult.details} ${medicalDisclaimer}`,
    source: "local-fallback",
    symptoms,
    imageReceived: Boolean(image)
  };
}

function safeJsonParse(value) {
  if (!value || typeof value !== "string") {
    return null;
  }

  const cleaned = value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (_error) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function extractResponseText(data) {
  if (data.output_text) {
    return data.output_text;
  }

  const output = Array.isArray(data.output) ? data.output : [];
  return output
    .flatMap((item) => item.content || [])
    .map((content) => content.text || "")
    .join("\n")
    .trim();
}

function normalizeAnalysis(data, fallback) {
  return {
    possibleCondition: data.possibleCondition || data.condition || fallback.possibleCondition,
    riskLevel: data.riskLevel || data.risk || fallback.riskLevel,
    confidence: Number(data.confidence || fallback.confidence),
    recommendation: data.recommendation || fallback.recommendation,
    details: data.details || fallback.details,
    visualFindings: data.visualFindings || data.imageFindings || "",
    source: "openai"
  };
}

async function buildImageContent(image) {
  if (!image?.path || !image?.mimetype?.startsWith("image/")) {
    return null;
  }

  const stats = await fs.stat(image.path);

  if (stats.size > MAX_INLINE_IMAGE_BYTES) {
    throw new Error("A imagem ultrapassa o limite para analise visual.");
  }

  const base64Image = await fs.readFile(image.path, "base64");

  return {
    type: "input_image",
    image_url: `data:${image.mimetype};base64,${base64Image}`
  };
}

async function analyzeMedicalData({ symptoms = "", image }) {
  const fallback = buildLocalFallback(symptoms, image);

  if (!process.env.AI_API_KEY) {
    return {
      ...fallback,
      source: "local-fallback-no-key"
    };
  }

  const baseUrl = process.env.AI_API_URL || OPENAI_BASE_URL;
  const endpoint = baseUrl.endsWith("/responses")
    ? baseUrl
    : `${baseUrl.replace(/\/$/, "")}/responses`;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  try {
    const imageContent = await buildImageContent(image);
    const prompt = [
      "Analise os dados enviados para uma triagem medica preliminar.",
      "Responda somente em JSON valido, sem markdown, com os campos:",
      "possibleCondition, riskLevel, confidence, recommendation, details, visualFindings.",
      "riskLevel deve ser Baixo, Moderado ou Alto.",
      "confidence deve ser um numero entre 0 e 100.",
      "Nao de diagnostico definitivo e inclua orientacao para procurar atendimento quando necessario.",
      "Se houver imagem, avalie apenas achados visuais observaveis e descreva incertezas.",
      "Nao afirme diagnosticos definitivos a partir da imagem.",
      `Sintomas: ${symptoms || "Nao informado"}`,
      imageContent
        ? `Imagem anexada para analise visual: ${image.filename || "sem nome"}, tipo ${image.mimetype}.`
        : image
          ? `Arquivo recebido, mas nao enviado para visao: ${image.filename || "sem nome"}, tipo ${image.mimetype || "desconhecido"}.`
          : "Imagem recebida: nao."
    ].join("\n");

    const content = [{ type: "input_text", text: prompt }];

    if (imageContent) {
      content.push(imageContent);
    }

    const response = await axios.post(
      endpoint,
      {
        model,
        reasoning: { effort: "low" },
        instructions:
          "Voce e um assistente de triagem medica. Seja cuidadoso, objetivo e nunca substitua consulta medica.",
        input: [
          {
            role: "user",
            content
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const text = extractResponseText(response.data || {});
    const parsed = safeJsonParse(text);

    if (!parsed) {
      throw new Error("A resposta da IA nao veio em JSON valido.");
    }

    return normalizeAnalysis(parsed, fallback);
  } catch (error) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message;
    console.warn(
      "Falha na API externa de IA. Retornando fallback local:",
      status ? `status ${status}` : error.message,
      apiMessage || ""
    );

    return {
      ...fallback,
      source: "local-fallback-api-error"
    };
  }
}

module.exports = {
  analyzeMedicalData
};
