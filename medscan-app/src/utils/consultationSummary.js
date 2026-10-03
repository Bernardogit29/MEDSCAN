import { getCaseVersions, timelineEntry, timelineDate } from "./caseTimeline";
const text = value => typeof value === "string" ? value : "";
const itemText = value => typeof value === "string" ? value : [value?.label, value?.text].filter(Boolean).join(": ");
export function consultationSummary(analysis, history, records, personName) {
  const versions = getCaseVersions(analysis, history);
  const personId = analysis.monitoredPersonId || "self";
  const sections = [
    { title: "1. Informações relatadas pela pessoa", note: "Texto original e complementos, sem interpretação automática. A duração aparece quando foi informada no relato.", entries: versions.map(version => {
      const entry = timelineEntry(version, versions);
      const answers = version.followUpContext?.at(-1);
      const questions = !entry.isOriginal && answers?.answer === version.additionalInfo && Array.isArray(answers.questions)
        ? answers.questions.map((question, i) => `${i + 1}. ${question}`).join("\n") : "";
      return { title: `${entry.title} · ${timelineDate(version.createdAt)}`, body: [entry.parentLabel, questions && `Perguntas às quais este complemento responde:\n${questions}`, entry.input || entry.inputMissing, version.imageUrl && "Anexo enviado neste registro; consulte o documento original no app."].filter(Boolean).join("\n\n") };
    }) },
    { title: "2. Medições registradas", note: "Até 100 medições recentes desta pessoa, conforme o prontuário. Podem não estar relacionadas a este relato. Valores de demonstração foram excluídos; estes registros não confirmam precisão de um dispositivo.", entries: records.filter(record => record.source === "recorded" && (record.monitoredPersonId || "self") === personId).map(record => ({
      title: timelineDate(record.measuredAt),
      body: [Number.isFinite(record.heartRate) && `Frequência cardíaca: ${record.heartRate} bpm`, Number.isFinite(record.glucose) && `Glicose: ${record.glucose} mg/dL`, record.bloodPressure && `Pressão: ${record.bloodPressure} mmHg`, record.sleep && `Sono: ${record.sleep}`, record.note && `Observação: ${record.note}`].filter(Boolean).join("\n") || "Sem valores disponíveis."
    })) },
    { title: "3. Interpretações da IA", note: "Conteúdo automático de cada versão, separado dos relatos. Não é diagnóstico nem substitui avaliação profissional.", entries: versions.map(version => {
      const result = version.result || version;
      const report = result.report || {};
      const entry = timelineEntry(version, versions);
      const list = (label, values) => Array.isArray(values) && values.length ? `${label}:\n${values.map(itemText).join("\n")}` : "";
      return { title: `${entry.title} · ${timelineDate(version.createdAt)}`, body: [
        (String(result.source || "").startsWith("local-fallback") || String(version._id).startsWith("mock")) && "Registro antigo de regras locais/demonstração; sem análise do provedor de IA.",
        text(report.summary), text(version.recommendation || result.recommendation),
        list("Próximos passos sugeridos", report.nextSteps), list("Sinais de alerta mencionados", report.redFlags),
        text(report.whenToSeekCare), text(report.limitations)
      ].filter(Boolean).join("\n\n") || "Interpretação não disponível neste registro." };
    }) }
  ];
  return { title: "Resumo para consulta", person: personName || analysis.monitoredPersonName || "Pessoa não informada", generatedAt: timelineDate(new Date().toISOString()), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, sections };
}
export const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export function summaryHtml(summary) {
  const e = escapeHtml;
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>MEDSCAN — Resumo para consulta</title><style>
    @page{size:A4;margin:18mm}body{font:12px/1.6 Arial,sans-serif;color:#163d36;margin:0}h1{font-size:25px}h2{font-size:18px;margin-top:28px;border-bottom:1px solid #bdd3ce;padding-bottom:8px}h3{font-size:13px;break-after:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere}article{margin-bottom:20px}.note,footer{color:#526762;font-size:11px}header{border-bottom:3px solid #075e52;padding-bottom:15px}h1,h2,h3{break-after:avoid}footer{margin-top:30px;border-top:1px solid #bdd3ce;padding-top:12px}</style></head><body><header><b>MEDSCAN</b><h1>${e(summary.title)}</h1><p>Pessoa: ${e(summary.person)}\nGerado em ${e(summary.generatedAt)}\nHorários: ${e(summary.timezone)}</p></header>${summary.sections.map(section => `<section><h2>${e(section.title)}</h2><p class="note">${e(section.note)}</p>${section.entries.length ? section.entries.map(entry => `<article><h3>${e(entry.title)}</h3><p>${e(entry.body)}</p></article>`).join("") : "<p>Nenhuma medição registrada disponível.</p>"}</section>`).join("")}<footer>Documento pessoal de apoio à consulta. Relatos e medições não foram verificados por um profissional. Compartilhe apenas com quem você escolher.</footer></body></html>`;
}
