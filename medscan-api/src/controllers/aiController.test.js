const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Analysis = require('../models/Analysis');
const aiService = require('../services/aiService');
const original = { create: Analysis.create, find: Analysis.findOne, analyze: aiService.analyzeMedicalData };
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
function controller() { delete require.cache[require.resolve('./aiController')]; return require('./aiController'); }
afterEach(() => { Analysis.create = original.create; Analysis.findOne = original.find; aiService.analyzeMedicalData = original.analyze; delete require.cache[require.resolve('./aiController')]; });
test('complement saves a new linked record and leaves original unchanged', async () => {
  const parent = { _id: '123456789012345678901234', symptoms: 'Relato original', monitoredPersonId: 'self', monitoredPersonName: 'Teste' };
  Analysis.findOne = async () => parent;
  let saved;
  Analysis.create = async value => { saved = { ...value, _id: 'new-id' }; return saved; };
  aiService.analyzeMedicalData = async input => { assert.match(input.symptoms, /Novo contexto/); return { possibleCondition: 'Orientação atualizada', report: {} }; };
  const res = response();
  await controller().analyze({ user: { _id: 'owner', name: 'Teste' }, body: { parentAnalysisId: parent._id, additionalInfo: 'Novo contexto', type: 'symptoms' } }, res, e => { throw e; });
  assert.equal(res.statusCode, 201); assert.equal(saved.caseId, parent._id); assert.equal(saved.parentAnalysisId, parent._id); assert.equal(parent.symptoms, 'Relato original'); assert.equal(saved.userId, 'owner');
});
test('provider failure never saves an incomplete revision', async () => {
  Analysis.findOne = async () => ({ _id: '123456789012345678901234', symptoms: 'Original' });
  Analysis.create = async () => { throw Error('Unexpected save'); };
  aiService.analyzeMedicalData = async () => { throw Object.assign(Error('Unavailable'), { status: 503 }); };
  let failure;
  await controller().analyze({ user: { _id: 'owner' }, body: { parentAnalysisId: '123456789012345678901234', additionalInfo: 'Novo contexto' } }, response(), e => { failure = e; });
  assert.equal(failure.status, 503);
});

test('controller sends and saves the same question-answer context for future complements', async () => {
  const parent={_id:'123456789012345678901234',symptoms:'Original',result:{report:{questionsForClinician:['Usa óculos?']}}};
  Analysis.findOne=async()=>parent;
  let sent,saved;
  aiService.analyzeMedicalData=async input=>{sent=input;return {report:{}}};
  Analysis.create=async value=>{saved=value;return value};
  await controller().analyze({user:{_id:'owner'},body:{parentAnalysisId:parent._id,additionalInfo:'1-sim'}},response(),e=>{throw e});
  assert.deepEqual(sent.followUpContext,[{questions:['Usa óculos?'],answer:'1-sim'}]);
  assert.deepEqual(saved.followUpContext,sent.followUpContext);
});
