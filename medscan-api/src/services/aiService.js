const fs = require("fs/promises");
const axios = require("axios");

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const DEFAULT_MODEL = "gemini-2.5-pro";
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

const analysisResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    possibleCondition: {
      type: "string",
      description: "Uma possibilidade ou grupo de sinais para investigar, nunca um diagnostico definitivo."
    },
    riskLevel: {
      type: "string",
      enum: ["Baixo", "Moderado", "Alto"]
    },
    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Confianca estimada na triagem, nao uma probabilidade de diagnostico."
    },
    recommendation: {
      type: "string",
      description: "Orientacao pratica e segura sobre o proximo passo."
    },
    details: {
      type: "string",
      description: "Relatorio detalhado em portugues, explicando o raciocinio, limites e o que deve ser observado."
    },
    visualFindings: {
      type: "string",
      description: "Somente achados visuais observaveis; se nao houver imagem, use uma string vazia."
    },
    report: {
      type: "object",
      additionalProperties: false,
      properties: {
        summary: { type: "string" },
        relevantFindings: {
          type: "array",
          items: { type: "string" }
        },
        possibleExplanations: {
          type: "array",
          items: { type: "string" }
        },
        redFlags: {
          type: "array",
          items: { type: "string" }
        },
        nextSteps: {
          type: "array",
          items: { type: "string" }
        },
        whenToSeekCare: { type: "string" },
        questionsForClinician: {
          type: "array",
          items: { type: "string" }
        },
        limitations: { type: "string" }
      },
      required: [
        "summary",
        "relevantFindings",
        "possibleExplanations",
        "redFlags",
        "nextSteps",
        "whenToSeekCare",
        "questionsForClinician",
        "limitations"
      ]
    }
  },
  required: [
    "possibleCondition",
    "riskLevel",
    "confidence",
    "recommendation",
    "details",
    "visualFindings",
    "report"
  ]
};

function normalizeText(value = "") {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function createFallbackReport(baseResult) {
  return {
    summary: baseResult.details,
    relevantFindings: ["Os dados informados foram considerados para uma triagem inicial."],
    possibleExplanations: [baseResult.possibleCondition],
    redFlags: ["Piora rapida, dor intensa, falta de ar, desmaio ou confusao exigem atendimento."],
    nextSteps: [baseResult.recommendation],
    whenToSeekCare: "Procure atendimento imediatamente se houver piora rapida ou qualquer sinal de alerta.",
    questionsForClinician: ["Ha quanto tempo os sintomas estao presentes?", "O que melhora ou piora os sintomas?"],
    limitations: "Esta triagem nao substitui historia clinica, exame fisico ou avaliacao de um profissional."
  };
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
    visualFindings: "",
    report: createFallbackReport(baseResult),
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

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch (_parseError) {
      return null;
    }
  }
}

function extractGeminiResponseText(data) {
  return (data.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("\n")
    .trim();
}

function asStringArray(value, fallback) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const items = value.map((item) => String(item).trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function normalizeReport(data, fallback) {
  const report = data?.report;

  if (!report || typeof report !== "object") {
    return fallback.report;
  }

  return {
    summary: report.summary || fallback.report.summary,
    relevantFindings: asStringArray(report.relevantFindings, fallback.report.relevantFindings),
    possibleExplanations: asStringArray(
      report.possibleExplanations,
      fallback.report.possibleExplanations
    ),
    redFlags: asStringArray(report.redFlags, fallback.report.redFlags),
    nextSteps: asStringArray(report.nextSteps, fallback.report.nextSteps),
    whenToSeekCare: report.whenToSeekCare || fallback.report.whenToSeekCare,
    questionsForClinician: asStringArray(
      report.questionsForClinician,
      fallback.report.questionsForClinician
    ),
    limitations: report.limitations || fallback.report.limitations
  };
}

function normalizeAnalysis(data, fallback) {
  return {
    possibleCondition: data.possibleCondition || data.condition || fallback.possibleCondition,
    riskLevel: ["Baixo", "Moderado", "Alto"].includes(data.riskLevel)
      ? data.riskLevel
      : fallback.riskLevel,
    confidence: Math.max(0, Math.min(100, Number(data.confidence) || fallback.confidence)),
    recommendation: data.recommendation || fallback.recommendation,
    details: data.details || fallback.details,
    visualFindings: data.visualFindings || data.imageFindings || fallback.visualFindings,
    report: normalizeReport(data, fallback),
    source: "gemini"
  };
}

async function buildImagePart(image) {
  if (!image?.path || !image?.mimetype?.startsWith("image/")) {
    return null;
  }

  const stats = await fs.stat(image.path);

  if (stats.size > MAX_INLINE_IMAGE_BYTES) {
    throw new Error("A imagem ultrapassa o limite para analise visual.");
  }

  const base64Image = await fs.readFile(image.path, "base64");

  return {
    inlineData: {
      mimeType: image.mimetype,
      data: base64Image
    }
  };
}

function buildGeminiEndpoint(model) {
  const normalizedModel = model.replace(/^models\//, "").trim();
  return `${GEMINI_BASE_URL}/models/${encodeURIComponent(normalizedModel)}:generateContent`;
}

async function analyzeMedicalData({ symptoms = "", image }) {
  const fallback = buildLocalFallback(symptoms, image);
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ...fallback,
      source: "local-fallback-no-gemini-key"
    };
  }

  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

  try {
    const imagePart = await buildImagePart(image);
    const prompt = [
      "Analise os dados enviados para uma triagem medica preliminar e produza um relatorio completo, claro e aprofundado em portugues do Brasil.",
      "Escreva como uma explicacao educativa de alta qualidade: comece com uma leitura humana do que a pessoa relatou, depois explique o que pode significar e organize a resposta em secoes praticas.",
      "Nao invente informacoes. Use somente os dados enviados e deixe explicito quando algo nao foi informado.",
      "Diferencie achados observados, possibilidades e diagnostico. Nunca apresente uma possibilidade como diagnostico confirmado.",
      "Nao forneca prescricao, dose de medicamento ou promessa de resultado. Para qualquer conduta individual, oriente avaliacao profissional.",
      "Crie orientacoes seguras e especificas para o quadro informado, sem conselhos genericos repetidos.",
      "Detalhe sinais de alerta, quando procurar pronto atendimento e quando marcar uma consulta, considerando a gravidade descrita.",
      "Se houver imagem, descreva somente achados visuais observaveis, qualidade da imagem e limites; nao confirme doencas pela imagem.",
      "Preencha todos os campos do JSON. O campo details deve ter varios paragrafos informativos. Use de 3 a 6 itens nos arrays quando houver informacao suficiente.",
      `Sintomas ou descricao: ${symptoms || "Nao informado"}`,
      imagePart
        ? `Imagem anexada para analise visual: ${image.filename || "sem nome"}, tipo ${image.mimetype}.`
        : image
          ? `Arquivo recebido, mas nao enviado para visao: ${image.filename || "sem nome"}, tipo ${image.mimetype || "desconhecido"}.`
          : "Imagem recebida: nao."
    ].join("\n");

    const parts = [{ text: prompt }];
    if (imagePart) {
      parts.push(imagePart);
    }

    const response = await axios.post(
      buildGeminiEndpoint(model),
      {
        systemInstruction: {
          parts: [
            {
              text:
                "Voce e um assistente de triagem medica cuidadoso. Responda em portugues do Brasil, com empatia, contexto e profundidade. Use linguagem acessivel, reconheca incertezas e priorize seguranca. A resposta e educativa e nao substitui profissional de saude."
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: analysisResponseSchema,
          temperature: 0.35,
          maxOutputTokens: 8192
        }
      },
      {
        params: {
          key: apiKey
        },
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 60000
      }
    );

    const text = extractGeminiResponseText(response.data || {});
    const parsed = safeJsonParse(text);

    if (!parsed) {
      throw new Error("A resposta do Gemini nao veio em JSON valido.");
    }

    return normalizeAnalysis(parsed, fallback);
  } catch (error) {
    const status = error.response?.status;
    const apiMessage = error.response?.data?.error?.message;
    console.warn(
      "Falha na API do Gemini. Retornando fallback local:",
      status ? `status ${status}` : error.message,
      apiMessage || ""
    );

    return {
      ...fallback,
      source: "local-fallback-gemini-error"
    };
  }
}

module.exports = {
  analyzeMedicalData
};
