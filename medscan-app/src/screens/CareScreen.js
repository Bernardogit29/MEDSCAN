import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import { getMonitoredPeople } from "../utils/monitoredPeople";
import { careKinds, careRoutes, careStatuses, careTimeline, localDate, inputDate, displayDate } from "../utils/careRecords";
import { timelineDate } from "../utils/caseTimeline";
import { fontFamily } from "../constants/theme";
import api from "../api/client";
import Header from "../components/Header";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import BottomTab from "../components/BottomTab";
import MeasurementChart from "../components/MeasurementChart";

import VaccinationOverview from "../components/VaccinationOverview";
import CareSchedule from "../components/CareSchedule";
import { matchesRecord } from "../utils/recordSearch";
import AppointmentNotes from "../components/AppointmentNotes";

const sectionDescriptions = { medication: "Sua rotina de medicamentos, doses e horários.", allergy: "Substâncias e reações que merecem atenção.", vaccine: "Sua carteira pessoal, organizada e fácil de acompanhar.", appointment: "Seus próximos encontros de cuidado.", timeline: "Seu histórico de cuidado em ordem cronológica.", chart: "Acompanhe a evolução das suas medições." };
const sections = { timeline:{ title:"Linha do tempo",icon:"timeline-clock-outline" }, ...careKinds, chart:{ title:"Gráfico",icon:"chart-line" } };
const statuses = { medication:["active","paused"],allergy:["active","inactive"],vaccine:["administered","planned"],appointment:["scheduled","completed","cancelled"] };
const emptyForm = kind => ({ kind,name:"",dose:"",times:"08:00",startDate:"",endDate:"",date:"",time:"",nextDate:"",location:"",reaction:"",severity:"",lot:"",notes:"",professional:"",questions:"",documents:"",instructions:"",status:statuses[kind]?.[0] });
export default function CareScreen({ navigation, route }) {
  const { colors, styles } = useAppTheme(createStyles), desktop = useDesktop(), { user, token } = useAuth();
  const routeSection=Object.entries(careRoutes).find(([,name])=>name===route.name)?.[0] || (sections[route.params?.section] ? route.params.section : "timeline");
  const [section,setSection]=useState(routeSection), [personId,setPersonId]=useState(route.params?.personId || "self");
  const [showPeople,setShowPeople]=useState(false), [showAllRecords,setShowAllRecords]=useState(false);
  const [search,setSearch]=useState("");
  const openedRecord = useRef("");
  const scope = `${user?._id || user?.id || "guest"}:${personId}`;
  const scopeRef = useRef(scope); scopeRef.current = scope;
  useEffect(()=>{setForm(null);setActionError("");},[scope]);
  const [people,setPeople]=useState(()=>getMonitoredPeople(user)), [records,setRecords]=useState([]), [doses,setDoses]=useState([]), [analyses,setAnalyses]=useState([]), [measurements,setMeasurements]=useState([]);
  const [loading,setLoading]=useState(false), [errors,setErrors]=useState({}), [revision,setRevision]=useState(0), [showArchived,setShowArchived]=useState(false), [filter,setFilter]=useState("all"), [visible,setVisible]=useState(30);
  const [form,setForm]=useState(null), [formError,setFormError]=useState(""), [saving,setSaving]=useState(false), [actionError,setActionError]=useState(""), [busy,setBusy]=useState("");
  useEffect(()=>{setSection(routeSection);setPersonId(route.params?.personId || "self");setShowArchived(false);setShowPeople(false);},[routeSection,route.params?.personId,route.params?.revision]);
  useFocusEffect(useCallback(()=>{
    let active=true;setRecords([]);setDoses([]);setAnalyses([]);setMeasurements([]);setErrors({});setActionError("");setVisible(30);
    if (!token || !user) {setLoading(false);return;}
    setLoading(true);
    Promise.allSettled([api.get("/profile"),api.get(`/care?personId=${encodeURIComponent(personId)}`),section === "timeline" ? api.get(`/history?personId=${encodeURIComponent(personId)}`) : Promise.resolve({data:[]}),["timeline","chart"].includes(section) ? api.get(`/monitoring/history?personId=${encodeURIComponent(personId)}`) : Promise.resolve({data:{records:[]}})]).then(results=>{
      if(!active)return;
      const issues={};
      if(results[0].status==="fulfilled"){
        const data=results[0].value.data, loaded=getMonitoredPeople(data.user || user,data.profile?.relatives || []);setPeople(loaded);
        if(!loaded.some(person=>person.id===personId)){setPersonId("self");return;}
      }else issues.profile="Não foi possível carregar a lista de pessoas.";
      if(results[1].status==="fulfilled" && Array.isArray(results[1].value.data.records) && Array.isArray(results[1].value.data.doses)){setRecords(results[1].value.data.records);setDoses(results[1].value.data.doses);}else issues.care="Não foi possível carregar os registros desta seção. Atualize e tente novamente.";
      if(results[2].status==="fulfilled" && Array.isArray(results[2].value.data))setAnalyses(results[2].value.data);else issues.analyses="Análises indisponíveis na linha do tempo.";
      if(results[3].status==="fulfilled" && Array.isArray(results[3].value.data.records))setMeasurements(results[3].value.data.records);else issues.measurements="Medições indisponíveis. Não foi possível montar o gráfico completo.";
      setErrors(issues);setLoading(false);
    }).catch(()=>{if(active){setErrors({care:"Não foi possível carregar o prontuário. Tente novamente."});setLoading(false);}});return()=>{active=false;};
  },[user,token,personId,revision,section]));
  const title=sections[section]?.title || "Prontuário", selectedName=people.find(person=>person.id===personId)?.name || "Pessoa selecionada";
  const scheduledSection=["medication","appointment"].includes(section);
  useEffect(()=>{setSearch("");},[scope,section]);
  useEffect(()=>{
    const key = `${scope}:${route.params?.revision}:${route.params?.openRecordId}`;
    const record = !loading && records.find(item=>item._id===route.params?.openRecordId && (item.monitoredPersonId || "self")===personId);
    if (record && openedRecord.current!==key) { openedRecord.current=key; edit(record); }
  },[records,loading,scope,personId,route.params?.revision,route.params?.openRecordId]);
  const listed=records.filter(record=>record.kind===section && Boolean(record.archived)===showArchived && matchesRecord(record,search)).sort((a,b)=>String(b.date || b.createdAt || "").localeCompare(String(a.date || a.createdAt || "")));
  const events=useMemo(()=>careTimeline(analyses,measurements,records,doses),[analyses,measurements,records,doses]).filter(event=>(filter==="all" || event.kind===filter) && matchesRecord({...event,...(event.analysis || event.record || {}),name:event.title,notes:[event.record?.notes,event.detail].filter(Boolean).join(" ")},search));
  function chip(label,selected,onPress,key=label){return <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{selected}} onPress={onPress} style={[styles.chip,selected && styles.chipActive]}><Text style={{color:selected?"white":colors.text,fontFamily,fontSize:12}}>{label}</Text></TouchableOpacity>;}
  function edit(record){setFormError("");setForm(record?{...emptyForm(record.kind),...record,times:(record.times || []).join(", "),...Object.fromEntries(["date","startDate","endDate","nextDate"].map(key=>[key,record[key]?displayDate(record[key]):""]))}:emptyForm(section));}
  async function save(){
    if(saving)return;setSaving(true);setFormError("");
    const requestScope=scope;
    try{
      const payload={...form,monitoredPersonId:personId,...Object.fromEntries(["date","startDate","endDate","nextDate"].map(key=>[key,inputDate(form[key] || "")]))};
      if(form.kind==="medication")payload.times=form.times.split(",").map(time=>time.trim()).filter(Boolean);
      const {data}=await (form._id?api.patch(`/care/${form._id}`,payload):api.post("/care",payload));
      if(scopeRef.current!==requestScope)return;
      if(!data?._id)throw new Error("O servidor não confirmou o registro.");
      setRecords(items=>[data,...items.filter(item=>item._id!==data._id)]);setForm(null);
    }catch(error){if(scopeRef.current!==requestScope)return;setFormError(error.response?.data?.message || error.message || "Não foi possível salvar.");}finally{setSaving(false);}
  }
  async function update(record,values){
    if(busy)return;setBusy(record._id);setActionError("");
    const requestScope=scope;
    try{const {data}=await api.patch(`/care/${record._id}`,values);if(scopeRef.current!==requestScope)return;if(!data?._id)throw new Error();setRecords(items=>items.map(item=>item._id===data._id?data:item));}
    catch(error){if(scopeRef.current!==requestScope)return;setActionError(error.response?.data?.message || "Não foi possível atualizar. O registro foi mantido.");}finally{setBusy("");}
  }
  async function taken(item){
    if(busy)return;setBusy(`${item.record._id}:${item.time}`);setActionError("");
    const requestScope=scope;
    try{const {data}=await api.post(`/care/${item.record._id}/doses`,{date:item.date,time:item.time});if(scopeRef.current!==requestScope)return;if(!data?._id)throw new Error();setDoses(items=>[data,...items.filter(dose=>dose._id!==data._id)]);}
    catch(error){if(scopeRef.current!==requestScope)return;setActionError(error.response?.data?.message || "Não foi possível registrar a tomada.");}finally{setBusy("");}
  }
  const field=(key,label,placeholder,multiline=false)=><Input key={key} label={label} value={form?.[key] || ""} onChangeText={value=>setForm(current=>({...current,[key]:value}))} editable={!saving} placeholder={placeholder} multiline={multiline}/>;
  return <SafeAreaView style={[styles.safe,desktop && desktopPage]}><ScrollView contentContainerStyle={[styles.content,desktop && desktopContent]}>
    <Header title={title} subtitle={sectionDescriptions[section]} onBack={()=>navigation.canGoBack()?navigation.goBack():navigation.navigate("History")} showBell={false}/>
    <View style={styles.personBar}>
      <View style={styles.personIcon}><MaterialCommunityIcons name="account-outline" size={20} color={colors.primary}/></View>
      <View style={{flex:1,gap:3}}><Text style={styles.note}>REGISTROS DE</Text><Text style={styles.heading}>{selectedName}</Text></View>
      {people.length>1?<TouchableOpacity accessibilityRole="button" accessibilityLabel="Trocar pessoa" accessibilityState={{expanded:showPeople}} onPress={()=>setShowPeople(value=>!value)} style={styles.personSwitch}><Text style={styles.badge}>Trocar</Text><MaterialCommunityIcons name={showPeople?"chevron-up":"chevron-down"} size={19} color={colors.primary}/></TouchableOpacity>:null}
    </View>
    {showPeople?<View style={styles.row}>{people.map(person=>chip(person.name,person.id===personId,()=>{setPersonId(person.id);setShowArchived(false);setShowPeople(false);},person.id))}</View>:null}
    {section==="vaccine" && !token ? <VaccinationOverview records={[]} unavailable/>:null}
    {!token ? <Card><Text style={styles.copy}>Entre para consultar e salvar seus registros.</Text><Button title="Entrar" onPress={()=>navigation.navigate("Login",{returnToPrevious:true})}/></Card> : <>
    {loading?<ActivityIndicator accessibilityLabel="Carregando prontuário" color={colors.primary}/>:null}
    {Object.values(errors).map(message=><Text key={message} accessibilityRole="alert" style={styles.error}>{message}</Text>)}
    {Object.keys(errors).length ? <Button title="Tentar carregar novamente" variant="outline" onPress={()=>setRevision(value=>value+1)}/>:null}
    {actionError?<Text accessibilityRole="alert" style={styles.error}>{actionError}</Text>:null}
    {section==="timeline" ? <>
      <Text style={styles.note}>Relatos, exames, medições, medicamentos, vacinas e consultas de {selectedName}. Datas futuras aparecem como planejamento. Horários locais do aparelho.</Text>
      <Input label="Buscar na linha do tempo" icon="magnify" value={search} onChangeText={value=>{setSearch(value);setVisible(30);}} placeholder="Medicamento, exame, sintoma ou profissional"/>
      <ScrollView horizontal><View style={styles.row}>{[["all","Tudo"],["report","Relatos"],["exam","Exames"],["measurement","Medições"],["medication","Medicamentos"],["allergy","Alergias"],["vaccine","Vacinas"],["appointment","Consultas"]].map(([key,label])=>chip(label,filter===key,()=>{setFilter(key);setVisible(30);},key))}</View></ScrollView>
      {!loading && !events.length?<Text style={styles.note}>{Object.keys(errors).length?"Os registros não estão disponíveis agora.":"Nenhum evento nesta categoria. Seus novos registros aparecerão aqui."}</Text>:null}
      {events.slice(0,visible).map(event=><TouchableOpacity key={event.id} accessibilityRole={event.analysis || event.record || event.measurement ? "button" : undefined} disabled={!event.analysis && !event.record && !event.measurement} onPress={()=>{if(event.analysis)navigation.navigate("Result",{analysis:event.analysis,caseVersions:analyses});else if(event.record)edit(event.record);else if(event.measurement){setSection("chart");} }} style={styles.timelineItem}>
        <View style={styles.dot}/><View style={{flex:1,gap:7}}><Text style={styles.note}>{event.dateOnly?displayDate(event.at):timelineDate(event.at)}{Date.parse(event.at)>Date.now()?" · Previsto":""}</Text><Text style={styles.heading}>{event.title}</Text><Text style={styles.copy}>{event.detail}</Text></View>
      </TouchableOpacity>)}
      {events.length>visible?<Button title="Mostrar mais eventos" variant="outline" onPress={()=>setVisible(value=>value+30)}/>:null}
      <Text style={styles.note}>Até 1.000 registros de cuidado e tomadas, mais as análises e até 100 medições recentes. Registros arquivados permanecem na linha do tempo.</Text>
    </>:section==="chart" ? <Card><MeasurementChart records={measurements} onRegister={()=>navigation.navigate("History",{personId,openMeasurement:true,revision:Date.now()})}/></Card>:<>
      <Button title={`Adicionar ${careKinds[section]?.singular || "registro"}`} icon="plus" disabled={loading || Boolean(errors.care)} onPress={()=>edit(null)}/>
      {scheduledSection?<CareSchedule key={`${scope+section}:${route.params?.revision || ""}`} initialDate={route.params?.agendaDate} kind={section} records={records} doses={doses} onTaken={taken} onEdit={edit} busy={busy} unavailable={loading || Boolean(errors.care)}/>:null}
      {scheduledSection?<TouchableOpacity accessibilityRole="button" accessibilityState={{expanded:showAllRecords}} onPress={()=>setShowAllRecords(value=>!value)} style={styles.recordsToggle}><Text style={styles.badge}>{showAllRecords?"Fechar lista de registros":"Gerenciar todos os registros"}</Text><MaterialCommunityIcons name={showAllRecords?"chevron-up":"chevron-down"} size={20} color={colors.primary}/></TouchableOpacity>:null}
      {section==="vaccine" ? <VaccinationOverview records={records} unavailable={loading || Boolean(errors.care)}/>:null}
      {!scheduledSection || showAllRecords ? <>
      <Input label="Buscar nesta seção" icon="magnify" value={search} onChangeText={setSearch} placeholder="Nome ou informação do registro"/>
      <View style={styles.row}>{chip("Registros atuais",!showArchived,()=>setShowArchived(false))}{chip("Arquivados",showArchived,()=>setShowArchived(true))}</View>
      {!loading && !listed.length && !errors.care?<Text style={styles.note}>Nenhum registro {showArchived?"arquivado":"nesta seção"} para {selectedName}.</Text>:null}
      {listed.map(record=><Card key={record._id} style={{gap:10}}><View style={styles.row}><MaterialCommunityIcons name={careKinds[record.kind].icon} size={24} color={colors.primary}/><Text style={[styles.heading,{flex:1}]}>{record.name}</Text></View><Text style={styles.badge}>{careStatuses[record.status]}{record.archived?" · Arquivado":""}</Text>
        {record.dose?<Text style={styles.copy}>Dose: {record.dose}</Text>:null}{record.kind==="medication"?<Text style={styles.copy}>Todos os dias · {(record.times || []).join(" • ")}{record.startDate?`\nInício: ${displayDate(record.startDate)}`:""}{record.endDate?`\nTérmino: ${displayDate(record.endDate)}`:""}</Text>:null}
        {record.date?<Text style={styles.copy}>{displayDate(record.date)} {record.time || ""}</Text>:null}{record.location?<Text style={styles.copy}>{record.location}</Text>:null}{record.reaction?<Text style={styles.copy}>Reação relatada: {record.reaction}</Text>:null}{record.severity?<Text style={styles.copy}>Gravidade informada: {record.severity}</Text>:null}{record.lot?<Text style={styles.copy}>Lote: {record.lot}</Text>:null}{record.notes?<Text style={styles.note}>{record.notes}</Text>:null}
        <View style={styles.row}><Button title="Editar" variant="outline" disabled={Boolean(busy)} onPress={()=>edit(record)}/><Button title={record.archived?"Restaurar":"Arquivar"} variant="outline" disabled={Boolean(busy)} onPress={()=>update(record,{archived:!record.archived})}/></View>
        {record.kind==="appointment"?<AppointmentNotes record={record}/>:null}
      </Card>)}
      </>:null}
    </>}
    </>}
  </ScrollView><BottomTab navigation={navigation} active="History"/>
  <Modal visible={Boolean(form)} animationType="slide" onRequestClose={()=>!saving && setForm(null)}><SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
    <Header title={`${form?._id?"Editar":"Adicionar"} ${careKinds[form?.kind]?.singular || "registro"}`} subtitle={selectedName} onBack={()=>!saving && setForm(null)} showBell={false}/>
    {form?<>
      {field("name",form.kind==="allergy"?"Substância ou medicamento":"Nome",form.kind==="appointment"?"Especialidade ou profissional":"Nome do registro")}
      {form.kind==="medication"?<>{field("dose","Dose conforme a prescrição","Ex.: 1 comprimido de 10 mg")}{field("times","Horários diários, separados por vírgula","08:00, 20:00")}{field("startDate","Início (opcional)","DD/MM/AAAA")}{field("endDate","Término (opcional)","DD/MM/AAAA")}<Text style={styles.note}>Copie o esquema prescrito. Para uso eventual ou frequência diferente de diária, registre a orientação nas observações e mantenha a agenda pausada.</Text></>:null}
      {form.kind==="allergy"?<>{field("reaction","Reação relatada","Descreva o que aconteceu",true)}{field("severity","Gravidade informada (opcional)","Conforme orientação recebida")}{field("date","Data em que foi identificada (opcional)","DD/MM/AAAA")}</>:null}
      {form.kind==="vaccine"?<>{field("dose","Dose (opcional)","Ex.: 1ª dose ou reforço")}{field("date","Data recebida ou prevista","DD/MM/AAAA")}{field("nextDate","Próxima dose informada (opcional)","DD/MM/AAAA")}{field("lot","Lote (opcional)","Conforme a carteira")}{field("location","Posto ou clínica (opcional)","Local informado")}</>:null}
      {form.kind==="appointment"?<>{field("professional","Profissional (opcional)","Nome de quem vai atender")}{field("date","Data da consulta","DD/MM/AAAA")}{field("time","Horário","HH:MM")}{field("location","Local ou endereço (opcional)","Clínica, posto ou atendimento online")}<Text style={styles.heading}>Antes da consulta</Text><Text style={styles.note}>Organize o que deseja conversar e levar. Use uma linha para cada item.</Text>{field("questions","Perguntas que quero fazer","Ex.: O que mudou nos meus exames?",true)}{field("documents","Documentos que preciso levar","Ex.: Exames recentes, receitas e documento de identificação",true)}<Text style={styles.heading}>Depois da consulta</Text>{field("instructions","Orientações recebidas","Registre o que o profissional orientou e os próximos passos.",true)}</>:null}
      <Text style={styles.heading}>Situação</Text><View style={styles.row}>{statuses[form.kind].map(status=>chip(careStatuses[status],form.status===status,()=>!saving && setForm(current=>({...current,status})),status))}</View>
      {field("notes","Observações (opcional)","Informações que deseja guardar",true)}
      {formError?<Text accessibilityRole="alert" style={styles.error}>{formError}</Text>:null}
      <Button title="Salvar registro" loading={saving} onPress={save}/><Button title="Cancelar" variant="outline" disabled={saving} onPress={()=>setForm(null)}/>
    </>:null}
  </ScrollView></SafeAreaView></Modal></SafeAreaView>;
}
const createStyles=colors=>StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background},content:{padding:20,paddingBottom:130,gap:17,width:"100%",maxWidth:860,alignSelf:"center"},
  personBar:{flexDirection:"row",gap:12,alignItems:"center",paddingVertical:8},personIcon:{width:42,height:42,borderRadius:14,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center"},personSwitch:{minHeight:44,flexDirection:"row",gap:5,alignItems:"center",paddingHorizontal:10},recordsToggle:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",gap:10,minHeight:48,borderTopWidth:1,borderTopColor:colors.border,paddingTop:12},
  row:{flexDirection:"row",flexWrap:"wrap",alignItems:"center",gap:10},chip:{padding:12,borderRadius:14,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface},chipActive:{backgroundColor:colors.hero},
  heading:{fontFamily,fontSize:16,fontWeight:"700",color:colors.text},copy:{fontFamily,fontSize:14,lineHeight:23,color:colors.text},note:{fontFamily,fontSize:12,lineHeight:20,color:colors.textMuted},
  badge:{color:colors.primary,fontFamily,fontSize:12,fontWeight:"600"},error:{color:colors.danger,lineHeight:22},time:{fontFamily,fontSize:19,fontWeight:"700",color:colors.primary},
  agendaItem:{flexDirection:"row",alignItems:"flex-start",gap:16,paddingVertical:16,borderTopWidth:1,borderColor:colors.border,marginTop:14},
  timelineItem:{flexDirection:"row",gap:16,borderLeftWidth:2,borderLeftColor:colors.border,paddingLeft:16,paddingVertical:14,marginLeft:8},dot:{width:10,height:10,borderRadius:5,backgroundColor:colors.primary,marginLeft:-22,marginTop:6}
});
