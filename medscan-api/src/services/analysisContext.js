const mongoose = require('mongoose');
const Analysis = require('../models/Analysis');
const Profile = require('../models/Profile');

function invalid(message, status = 400) { return Object.assign(new Error(message), { status }); }
async function resolveAnalysisContext(user, body) {
  if (body.parentAnalysisId) {
    if (!mongoose.isValidObjectId(body.parentAnalysisId)) throw invalid('Registro original inválido.');
    const parent = await Analysis.findOne({ _id: body.parentAnalysisId, userId: user._id });
    if (!parent) throw invalid('Registro original não encontrado nesta conta.', 404);
    const addition = typeof body.additionalInfo === 'string' ? body.additionalInfo.trim() : '';
    if (!addition || addition.length > 4000) throw invalid('Escreva o complemento em até 4.000 caracteres.');
    const symptoms = `${parent.symptoms || ''}\n\nInformações adicionais fornecidas agora:\n${addition}`;
    if (symptoms.length > 12000) throw invalid('Este relato atingiu o limite de texto. Inicie um novo relato com um resumo das informações.');
    const questions = parent.result?.report?.questionsForClinician;
    // Use only the owned, selected record. The client cannot replace the questions.
    const followUpContext = [...(parent.followUpContext || []).map(turn => ({
      questions: [...turn.questions], answer: turn.answer
    })), {
      questions: Array.isArray(questions) ? questions.filter(q => typeof q === 'string' && q.trim()) : [],
      answer: addition
    }];
    if (JSON.stringify(followUpContext).length > 24000) throw invalid('Este relato atingiu o limite de contexto. Inicie um novo relato resumindo as informações.');
    return { symptoms, followUpContext, additionalInfo: addition, parentAnalysisId: parent._id, caseId: parent.caseId || parent._id, monitoredPersonId: parent.monitoredPersonId || 'self', monitoredPersonName: parent.monitoredPersonName || user.name };
  }
  const personId = body.monitoredPersonId || 'self';
  let name = user.name;
  if (personId !== 'self') {
    const profile = await Profile.findOne({ userId: user._id });
    const person = profile?.relatives?.find(person => person.id === personId);
    if (!person) throw invalid('Pessoa não encontrada no seu prontuário.', 404);
    name = person.name;
  }
  return { symptoms: body.symptoms || '', monitoredPersonId: personId, monitoredPersonName: name };
}
module.exports = { resolveAnalysisContext };
