import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import Input from "./Input";
import { fontFamily } from "../constants/theme";
import { matchesRecord } from "../utils/recordSearch";
import { groupAnalyses } from "../utils/analysisGroups";
import { careKinds, careRoutes, displayDate } from "../utils/careRecords";

const filters = [["all","Tudo"],["medication","Medicamentos"],["exam","Exames"],["symptoms","Sintomas"],["appointment","Consultas"],["allergy","Alergias"],["vaccine","Vacinas"]];
export default function RecordSearch({ history, records, personId, preferences, loading, errors, navigation }) {
  const {colors} = useAppTheme();
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState("all");
  const [visible,setVisible] = useState(20);
  const text = {fontFamily,color:colors.text,fontSize:14,lineHeight:21};
  const active = query.trim().length>0;
  const analyses = groupAnalyses(history,preferences.oldestFirst).filter(group=>group.versions.some(item=>matchesRecord(item,query)))
    .map(group=>({id:`analysis:${group.id}`,kind:group.original.type==="symptoms"?"symptoms":"exam",group}));
  const care = records.filter(record=>matchesRecord(record,query)).map(record=>({id:`care:${record._id}`,kind:record.kind,record}));
  const results = [...care,...analyses].filter(item=>filter==="all" || item.kind===filter);
  function open(item) {
    if(item.group) navigation.navigate("Result",{analysis:item.group.latest,caseVersions:item.group.versions});
    else navigation.navigate(careRoutes[item.kind],{section:item.kind,personId,openRecordId:item.record._id,revision:Date.now()});
  }
  return <View style={{gap:12}}>
    <Input label="Buscar no prontuário" icon="magnify" value={query} onChangeText={value=>{setQuery(value);setVisible(20);}} placeholder="Medicamento, exame, sintoma ou profissional"/>
    {active?<>
      <TouchableOpacity accessibilityRole="button" onPress={()=>{setQuery("");setFilter("all");}}><Text style={[text,{fontSize:12,color:colors.primary}]}>Limpar busca</Text></TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={{flexDirection:"row",gap:8}}>{filters.map(([key,label])=><TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{selected:key===filter}} onPress={()=>{setFilter(key);setVisible(20);}} style={{padding:12,borderRadius:14,backgroundColor:key===filter?colors.hero:colors.surface,borderWidth:1,borderColor:colors.border}}><Text style={[text,{fontSize:12,color:key===filter?"white":colors.text}]}>{label}</Text></TouchableOpacity>)}</View></ScrollView>
      {errors.filter(Boolean).map(message=><Text key={message} accessibilityRole="alert" style={[text,{fontSize:12,color:colors.danger}]}>{message}</Text>)}
      <Text accessibilityLiveRegion="polite" style={[text,{fontSize:12,color:colors.textMuted}]}>{loading?"Carregando registros…":`${results.length} ${results.length===1?"resultado":"resultados"} para “${query.trim()}”`}</Text>
      {!loading&&!results.length?<Text style={[text,{fontSize:12,color:colors.textMuted}]}>Nenhum registro encontrado. Tente outro termo ou categoria.</Text>:null}
      {results.slice(0,visible).map(item=><TouchableOpacity key={item.id} accessibilityRole="button" onPress={()=>open(item)} style={{padding:16,borderRadius:18,gap:6,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface}}>
        <Text style={[text,{fontSize:11,color:colors.primary,fontWeight:"700"}]}>{careKinds[item.kind]?.title || (item.kind==="symptoms"?"Sintomas e orientações":"Exames e imagens")}{item.record?.archived?" · Arquivado":""}</Text>
        <Text style={[text,{fontWeight:"700"}]}>{item.record?.name || (preferences.hideHealthPreviews?"Prévia de saúde oculta":item.group.latest.possibleCondition || "Análise registrada")}</Text>
        {item.record?.professional?<Text style={[text,{fontSize:12,color:colors.textMuted}]}>{item.record.professional}</Text>:null}
        {item.record?.date?<Text style={[text,{fontSize:12,color:colors.textMuted}]}>{displayDate(item.record.date)} {item.record.time || ""}</Text>:null}
        <Text style={[text,{fontSize:12,color:colors.primary}]}>Abrir registro →</Text>
      </TouchableOpacity>)}
      {results.length>visible?<TouchableOpacity accessibilityRole="button" onPress={()=>setVisible(value=>value+20)}><Text style={[text,{color:colors.primary}]}>Mostrar mais resultados</Text></TouchableOpacity>:null}
      <Text style={[text,{fontSize:11,color:colors.textMuted}]}>Busca nos registros carregados desta pessoa, incluindo os arquivados. Análises do mesmo relato aparecem juntas.</Text>
    </>:null}
  </View>;
}
