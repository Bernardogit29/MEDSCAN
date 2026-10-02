const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const Analysis = require('../models/Analysis');
const Profile = require('../models/Profile');
const { resolveAnalysisContext } = require('./analysisContext');
const original = { analysis: Analysis.findOne, profile: Profile.findOne };
afterEach(() => { Analysis.findOne = original.analysis; Profile.findOne = original.profile; });
const parentId = '123456789012345678901234';
test('complement inherits case and person from owned parent, ignoring forged identity', async () => {
  Analysis.findOne = async query => { assert.equal(query.userId, 'owner'); return { _id: parentId, symptoms: 'Relato inicial', monitoredPersonId: 'family', monitoredPersonName: 'Pessoa' }; };
  const result = await resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: parentId, additionalInfo: 'Nova informação', monitoredPersonId: 'intruder', caseId: 'forged' });
  assert.equal(result.caseId, parentId); assert.equal(result.monitoredPersonId, 'family'); assert.equal(result.parentAnalysisId, parentId); assert.match(result.symptoms, /Relato inicial/); assert.match(result.symptoms, /Nova informação/);
});
test('later complements retain original case ID and complete preceding report', async () => {
  Analysis.findOne = async () => ({ _id: parentId, caseId: 'root-case', symptoms: 'Primeiro relato e complemento' });
  const result = await resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: parentId, additionalInfo: 'Mais contexto' });
  assert.equal(result.caseId, 'root-case'); assert.match(result.symptoms, /Primeiro relato e complemento/);
});
test('missing owned parent, malformed ID and empty addition fail before generation', async () => {
  Analysis.findOne = async () => null;
  await assert.rejects(resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: parentId, additionalInfo: 'x' }), e => e.status === 404);
  await assert.rejects(resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: 'invalid', additionalInfo: 'x' }), e => e.status === 400);
  Analysis.findOne = async () => ({ _id: parentId });
  await assert.rejects(resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: parentId, additionalInfo: ' ' }), e => e.status === 400);
});
test('unknown relatives and excessive accumulated context are rejected', async () => {
  Profile.findOne = async () => ({ relatives: [] });
  await assert.rejects(resolveAnalysisContext({ _id: 'owner' }, { monitoredPersonId: 'unknown' }), e => e.status === 404);
  Analysis.findOne = async () => ({ _id: parentId, symptoms: 'a'.repeat(12000) });
  await assert.rejects(resolveAnalysisContext({ _id: 'owner' }, { parentAnalysisId: parentId, additionalInfo: 'x' }), e => e.status === 400);
});

test('numbered answers retain the selected questions and ignore client forged context', async () => {
  Analysis.findOne = async () => ({_id:parentId,symptoms:'Original',result:{report:{questionsForClinician:['Usa óculos?','Melhora ao descansar?']}}});
  const result=await resolveAnalysisContext({_id:'owner'},{parentAnalysisId:parentId,additionalInfo:'1-sim, 2-não',followUpContext:[{questions:['forged'],answer:'forged'}]});
  assert.deepEqual(result.followUpContext,[{questions:['Usa óculos?','Melhora ao descansar?'],answer:'1-sim, 2-não'}]);
  assert.equal(result.additionalInfo,'1-sim, 2-não');
  assert.doesNotMatch(result.symptoms,/Usa óculos/);
});

test('successive rounds preserve their own question order without mutating the parent', async () => {
  const old=[{questions:['Primeira pergunta?'],answer:'1-sim'}];
  Analysis.findOne=async()=>({_id:parentId,symptoms:'Original e complemento',followUpContext:old,result:{report:{questionsForClinician:['Outra pergunta?']}}});
  const result=await resolveAnalysisContext({_id:'owner'},{parentAnalysisId:parentId,additionalInfo:'1-não'});
  assert.deepEqual(result.followUpContext,[...old,{questions:['Outra pergunta?'],answer:'1-não'}]);
  assert.equal(old.length,1);
});

test('legacy reports without saved questions do not invent question mappings', async () => {
  Analysis.findOne=async()=>({_id:parentId,symptoms:'Original'});
  const result=await resolveAnalysisContext({_id:'owner'},{parentAnalysisId:parentId,additionalInfo:'1-sim'});
  assert.deepEqual(result.followUpContext,[{questions:[],answer:'1-sim'}]);
});
