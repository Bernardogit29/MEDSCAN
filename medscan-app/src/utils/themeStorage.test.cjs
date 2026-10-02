const {test}=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm'), babel=require('@babel/core');
function load(file,globals={}) {const exports={};const code=babel.transformSync(fs.readFileSync(require.resolve(file),'utf8'),{configFile:false,babelrc:false,plugins:['@babel/plugin-transform-modules-commonjs']}).code;vm.runInNewContext(code,{exports,...globals});return exports;}
test('web theme survives reload and can return to light',async()=>{
 const values=new Map(),localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const first=load('./themeStorage.js',{localStorage});assert.equal(await first.readTheme(),null);await first.writeTheme('dark');
 const reopened=load('./themeStorage.js',{localStorage});assert.equal(await reopened.readTheme(),'dark');await reopened.writeTheme('light');assert.equal(await first.readTheme(),'light');
});
test('native theme persists in document storage across launches',async()=>{
 const files=new Map(),native={documentDirectory:'file:///documents/',getInfoAsync:async p=>({exists:files.has(p)}),readAsStringAsync:async p=>files.get(p),writeAsStringAsync:async(p,v)=>files.set(p,v)};
 const globals={require:name=>{assert.equal(name,'expo-file-system/legacy');return native;}};
 const first=load('./themeStorage.native.js',globals);assert.equal(await first.readTheme(),null);await first.writeTheme('dark');
 assert.equal(await load('./themeStorage.native.js',globals).readTheme(),'dark');assert.deepEqual([...files.keys()],['file:///documents/medscan-appearance.txt']);
});
test('write errors propagate instead of reporting success',async()=>{
 const storage=load('./themeStorage.js',{localStorage:{setItem(){throw Error('blocked')}}});await assert.rejects(storage.writeTheme('dark'),/blocked/);
});
test('missing native document storage is not silently accepted',async()=>{
 const storage=load('./themeStorage.native.js',{require:()=>({documentDirectory:null})});await assert.rejects(storage.writeTheme('dark'),/indisponível/);
});
