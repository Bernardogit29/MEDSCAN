export const mockAnalysis = {
  _id: "mock-analysis",
  type: "image",
  symptoms: "Lesao de pele com alteracao recente.",
  imageUrl: "",
  possibleCondition: "Alteracao na pele",
  riskLevel: "Moderado",
  confidence: 78,
  recommendation: "Consulte um dermatologista para avaliacao presencial.",
  result: {
    details:
      "Caracteristicas visuais e sintomas informados indicam necessidade de avaliacao clinica. Esta analise e apenas orientativa."
  },
  monitoredPersonId: "maria",
  monitoredPersonName: "Maria Silva",
  createdAt: new Date().toISOString()
};

export const mockHistory = [
  mockAnalysis,
  {
    _id: "mock-history-2",
    type: "symptoms",
    symptoms: "Dor de cabeca leve e congestao nasal.",
    imageUrl: "",
    possibleCondition: "Sintomas respiratorios",
    riskLevel: "Baixo",
    confidence: 72,
    recommendation: "Observe os sintomas, hidrate-se e procure atendimento se houver piora.",
    result: {
      details: "Sintomas descritos sao compativeis com quadro leve, mas devem ser acompanhados."
    },
    monitoredPersonId: "maria",
    monitoredPersonName: "Maria Silva",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const mockNotifications = [
  {
    _id: "notification-1",
    title: "Resultado de analise disponivel",
    description: "Sua ultima analise com IA ja pode ser consultada.",
    type: "analysis",
    time: "Hoje - 14:32",
    unread: true
  },
  {
    _id: "notification-2",
    title: "Lembrete de acompanhamento",
    description: "Registre novos sintomas caso tenha percebido alguma mudanca.",
    type: "reminder",
    time: "Hoje - 09:15",
    unread: true
  },
  {
    _id: "notification-3",
    title: "Pressao acima do normal",
    description: "Um alerta demonstrativo foi gerado no monitoramento preventivo.",
    type: "alert",
    time: "Ontem - 20:30",
    unread: false
  },
  {
    _id: "notification-4",
    title: "Novo dispositivo sincronizado",
    description: "Smartwatch conectado ao perfil de monitoramento.",
    type: "device",
    time: "Ontem - 18:10",
    unread: false
  },
  {
    _id: "notification-5",
    title: "Consulta recomendada",
    description: "Procure avaliacao medica presencial para confirmar o resultado.",
    type: "recommendation",
    time: "10/06/2026 - 11:45",
    unread: false
  }
];

export const mockMonitoring = {
  monitoredPerson: {
    name: "Maria Silva",
    age: 72,
    status: "Estavel"
  },
  vitals: {
    heartRate: 82,
    glucose: 98,
    bloodPressure: "120/80",
    sleep: "7h 30m",
    status: "Estavel"
  },
  alerts: [
    {
      title: "Pressao acima do normal",
      description: "Detectado as 08:42",
      level: "Atencao"
    },
    {
      title: "Proximo lembrete",
      description: "08:00 - Losartana 50mg",
      level: "Lembrete"
    }
  ]
};

export const mockDevices = [
  { _id: "device-1", name: "Smartwatch", type: "wearable", battery: 85, connected: true },
  { _id: "device-2", name: "Oximetro", type: "oximeter", battery: 90, connected: true },
  { _id: "device-3", name: "Glicose", type: "glucose", battery: 80, connected: true },
  { _id: "device-4", name: "Pressao arterial", type: "blood-pressure", battery: 70, connected: true }
];
