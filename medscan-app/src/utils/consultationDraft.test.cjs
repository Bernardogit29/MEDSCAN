const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), vm = require('node:vm'), babel = require('@babel/core');
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const code = babel.transformSync(fs.readFileSync(require.resolve(file), 'utf8'), { configFile:false, babelrc:false, plugins:['@babel/plugin-transform-modules-commonjs'] }).code;
  vm.runInNewContext(code, { exports, console, require: name => dependencies[name] || load(name + '.js'), Date, Intl, ...globals });
  return exports;
}
const { consultationSummary, summaryHtml } = load('./consultationSummary.js');
const original = { _id:'root', monitoredPersonId:'self', symptoms:'Dor relatada.\nDuração: dois dias', createdAt:'2026-10-01T12:00:00Z', result:{report:{summary:'Interpretação fictícia da IA'}} };
const child = { _id:'child', caseId:'root', parentAnalysisId:'root', monitoredPersonId:'self', symptoms:'Texto acumulado que não deve se repetir', additionalInfo:'1 — Sim', followUpContext:[{questions:['Melhorou?'],answer:'1 — Sim'}], createdAt:'2026-10-02T12:00:00Z', result:{report:{summary:'Nova interpretação fictícia'}} };
test('summary separates patient words, AI, people and simulations', () => {
  const model = consultationSummary(child, [child, original, {...original,_id:'unrelated'}, {...child,_id:'other',monitoredPersonId:'relative'}], [
    {source:'recorded',monitoredPersonId:'self',heartRate:74,measuredAt:original.createdAt},
    {source:'demo',monitoredPersonId:'self',heartRate:999},
    {source:'recorded',monitoredPersonId:'relative',heartRate:888}
  ],'Pessoa fictícia');
  assert.equal(model.sections[0].entries.length,2);
  assert.match(model.sections[0].entries[0].body,/Duração: dois dias/);
  assert.match(model.sections[0].entries[1].body,/Melhorou\?/);
  assert.match(model.sections[0].entries[1].body,/1 — Sim/);
  assert.doesNotMatch(JSON.stringify(model.sections[0]),/Interpretação|Texto acumulado/);
  assert.equal(model.sections[1].entries.length,1);
  assert.match(model.sections[1].entries[0].body,/74 bpm/);
  assert.match(model.sections[2].entries[1].body,/Nova interpretação/);
});
test('print HTML escapes patient content and preserves Portuguese', () => {
  const html = summaryHtml(consultationSummary({...original,symptoms:'<script>alert(1)</script> & pressão'},[],[],'<img src=x>'));
  assert.doesNotMatch(html,/<script>|<img src=x>/);
  assert.match(html,/&lt;script&gt;/); assert.match(html,/pressão/); assert.match(html,/charset="utf-8"/);
});
test('missing parent is explicit rather than inventing an initial report',()=> {
  const model=consultationSummary(child,[],[],'Teste');
  assert.match(model.sections[0].entries[0].body,/Registro anterior não carregado/);
});
test('queued save, recovery and clear cannot resurrect an old draft',async()=>{
  const values = new Map(), calls=[];
  const storage={readDraft:async k=>values.get(k),writeDraft:async(k,v)=>{calls.push(v); if(v===null)values.delete(k);else values.set(k,v);}};
  const queue=load('./draftQueue.js',{'./draftStorage':storage});
  const first=queue.saveDraft('account-a:self',{symptoms:'Primeiro',selectedImage:{uri:'data:image/png;base64,abcd'}});
  const second=queue.saveDraft('account-a:self',{symptoms:'Segundo'});
  const clear=queue.saveDraft('account-a:self',null);
  await Promise.all([first,second,clear]);
  assert.equal(await queue.loadDraft('account-a:self'),undefined); assert.equal(calls.length,3);
  assert.equal(await queue.loadDraft('account-b:self'),undefined);
});
test('native draft restores fields and durable attachment across launches',async()=>{
  const files=new Map();
  const native={documentDirectory:'file:///documents/',getInfoAsync:async p=>({exists:files.has(p)}),readAsStringAsync:async p=>files.get(p),writeAsStringAsync:async(p,v)=>files.set(p,v),moveAsync:async({from,to})=>{files.set(to,files.get(from));files.delete(from);},copyAsync:async({to})=>files.set(to,'image'),deleteAsync:async p=>files.delete(p)};
  const storage=load('./draftStorage.native.js',{'expo-file-system/legacy':native});
  const asset=await storage.durableAttachment({uri:'file:///temporary.jpg',fileName:'teste.jpg',mimeType:'image/jpeg'});
  const draft={symptoms:'Exemplo',duration:'2 dias',intensity:'Leve',context:'Teste',selectedImage:asset,status:'submitting'};
  await storage.writeDraft('user:self',draft);
  const restored=await load('./draftStorage.native.js',{'expo-file-system/legacy':native}).readDraft('user:self');
  assert.equal(JSON.stringify(restored),JSON.stringify(draft)); assert.equal(files.has(asset.uri),true);
  assert.equal(await storage.readDraft('another:self'),null);
  await storage.writeDraft('user:self',null);await storage.releaseAttachment(asset);
  assert.equal(await storage.readDraft('user:self'),null);assert.equal(files.has(asset.uri),false);
});
test('failed writes do not block a subsequent retry',async()=>{
  let failed=true,value;
  const queue=load('./draftQueue.js',{'./draftStorage':{readDraft:async()=>value,writeDraft:async(k,v)=>{if(failed)throw Error('full');value=v;}}});
  await assert.rejects(queue.saveDraft('key',{symptoms:'Keep me'}),/full/);
  failed=false;await queue.saveDraft('key',{symptoms:'Keep me'});assert.equal((await queue.loadDraft('key')).symptoms,'Keep me');
});
function hookHarness(values=new Map()) {
  const slots=[], pending=[];let cursor=0;
  const react={
    useRef(value){const i=cursor++;return slots[i]||(slots[i]={current:value});},
    useState(value){const i=cursor++;if(!(i in slots))slots[i]=value;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},
    useEffect(fn,deps){const i=cursor++;if(!slots[i]||deps.some((v,n)=>v!==slots[i].deps[n])){slots[i]?.cleanup?.();slots[i]={deps};pending.push(()=>{slots[i].cleanup=fn();});}}
  };
  const hook=load('./useAnalysisDraft.js',{'react':react,'./draftQueue':{loadDraft:async k=>values.get(k),saveDraft:async(k,v)=>{if(v===null)values.delete(k);else values.set(k,v);}}}).default;
  return {values,render(key){cursor=0;const result=hook(key,{symptoms:'',status:'editing',selectedImage:null});while(pending.length)pending.shift()();return result;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('draft hook restores interrupted requests, attachment and account isolation',async()=>{
  const h=hookHarness(new Map([['a:self',{symptoms:'Relato A',status:'submitting',selectedImage:{uri:'data:image/png;base64,abcd'}}]]));
  assert.equal(h.render('a:self').ready,false);await tick();let draft=h.render('a:self');
  assert.equal(draft.value.status,'interrupted');assert.equal(draft.value.symptoms,'Relato A');assert.match(draft.value.selectedImage.uri,/data:image/);
  assert.equal(h.render('b:self').value.symptoms,'');await tick();assert.equal(h.render('b:self').value.symptoms,'');
  await draft.clear();assert.equal(h.render('b:self').value.symptoms,'');assert.equal(h.values.has('a:self'),false);
});
test('guest form continues through login without leaking a signed-in account form',async()=>{
  const h=hookHarness();h.render(null);await tick();await h.render(null).update({symptoms:'Rascunho visitante'});
  h.render('a:self');await tick();assert.equal(h.render('a:self').value.symptoms,'Rascunho visitante');
  h.render(null);await tick();assert.equal(h.render(null).value.symptoms,'');
  h.render('b:self');await tick();assert.equal(h.render('b:self').value.symptoms,'');
});
test('web export writes the complete document before requesting print', async()=>{
  const calls=[];
  const popup={opener:{},document:{open:()=>calls.push('open'),write:html=>calls.push(html),close:()=>calls.push('close')},focus:()=>calls.push('focus'),print:()=>calls.push('print')};
  const {printSummary}=load('./printSummary.js',{}, {window:{open:()=>popup}});
  await printSummary('<html lang="pt-BR">Resumo fictício</html>');
  assert.deepEqual(calls,['open','<html lang="pt-BR">Resumo fictício</html>','close','focus','print']);
  assert.equal(popup.opener,null);
});
test('blocked print popup returns an actionable error', async()=>{
  const {printSummary}=load('./printSummary.js',{}, {window:{open:()=>null}});
  await assert.rejects(printSummary('Resumo'),/Permita a abertura/);
});
test('native PDF is shared only after generation and cleaned even if sharing fails',async()=>{
  const calls=[];
  const {printSummary}=load('./printSummary.native.js',{
    'expo-print':{printToFileAsync:async({html})=>{calls.push(html);return {uri:'file:///cache/test.pdf'};}},
    'expo-sharing':{isAvailableAsync:async()=>true,shareAsync:async(uri,options)=>{calls.push(uri);assert.equal(options.mimeType,'application/pdf');throw Error('sharing failed');}},
    'expo-file-system/legacy':{deleteAsync:async uri=>calls.push('delete:'+uri)}
  });
  await assert.rejects(printSummary('Resumo fictício'),/sharing failed/);
  assert.deepEqual(calls,['Resumo fictício','file:///cache/test.pdf','delete:file:///cache/test.pdf']);
});
test('native devices without sharing fall back to the print dialog',async()=>{
  let printed;
  const {printSummary}=load('./printSummary.native.js',{
    'expo-print':{printAsync:async({html})=>{printed=html;}},
    'expo-sharing':{isAvailableAsync:async()=>false},
    'expo-file-system/legacy':{}
  });
  await printSummary('Resumo fictício');assert.equal(printed,'Resumo fictício');
});
