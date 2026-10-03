import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import { useAppTheme } from "../context/ThemeContext";
import { chartPoints, measurementOrigin } from "../utils/careRecords";
import { timelineDate } from "../utils/caseTimeline";
import Button from "./Button";

export default function MeasurementChart({ records, onRegister }) {
  const { colors } = useAppTheme();
  const [metric,setMetric] = useState("heartRate"), [days,setDays] = useState(30), [selected,setSelected] = useState(null), [demo,setDemo] = useState(false), [width,setWidth] = useState(310);
  const simulation = useMemo(()=>[72,76,70,80,74,73].map((value,index)=>({_id:`simulation-${index}`,heartRate:value,glucose:90+index*2,measuredAt:new Date(Date.now()-(5-index)*3600000).toISOString(),origin:"simulation",note:"Exemplo fictício; não foi salvo no prontuário."})),[]);
  const points = chartPoints(demo ? simulation : records,metric,days);
  const valueLabel = metric === "heartRate" ? "Frequência cardíaca" : "Glicose", unit = metric === "heartRate" ? "bpm" : "mg/dL";
  const values = points.map(point=>point[metric]), low = Math.min(...values), high = Math.max(...values), padding = low===high ? Math.max(1,low*.05) : (high-low)*.15;
  const min = low-padding, max = high+padding, start = Date.parse(points[0]?.measuredAt), end = Date.parse(points.at(-1)?.measuredAt);
  const x = point => end===start ? width/2 : 42+(Date.parse(point.measuredAt)-start)/(end-start)*(width-62);
  const y = point => 155-(point[metric]-min)/(max-min)*125;
  const current = points.find(point=>String(point._id)===selected);
  function chip(label,active,onPress,key=label) { return <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{selected:active}} onPress={onPress} style={{padding:10,borderRadius:12,backgroundColor:active?colors.hero:colors.surface,borderWidth:1,borderColor:colors.border}}><Text style={{color:active?"white":colors.text}}>{label}</Text></TouchableOpacity>; }
  return <View style={{gap:16}} onLayout={event=>setWidth(Math.max(240,event.nativeEvent.layout.width))}>
    <Text style={{fontSize:20,fontWeight:"700",color:colors.text}}>Medições ao longo do tempo</Text>
    <Text style={{color:colors.textMuted,lineHeight:21}}>Toque em um ponto para ver o valor, horário e origem. Até 100 medições recentes; a linha apenas liga os registros.</Text>
    <View style={{flexDirection:"row",flexWrap:"wrap",gap:8}}>{chip("Frequência",metric==="heartRate",()=>{setMetric("heartRate");setSelected(null);})}{chip("Glicose",metric==="glucose",()=>{setMetric("glucose");setSelected(null);})}</View>
    <View style={{flexDirection:"row",gap:8}}>{[[7,"7 dias"],[30,"30 dias"],[0,"Todos"]].map(([value,label])=>chip(label,days===value,()=>{setDays(value);setSelected(null);}))}</View>
    <Button title={demo?"Voltar às medições registradas":"Ver exemplo simulado"} variant="outline" onPress={()=>{setDemo(!demo);setSelected(null);}} />
    {demo ? <Text style={{color:colors.primary,fontWeight:"700"}}>SIMULAÇÃO · dados fictícios, sem leitura de sensor.</Text> : null}
    {!points.length ? <Text style={{color:colors.textMuted,paddingVertical:24}}>Nenhuma medição deste indicador no período. Registre um valor ou escolha outro período.</Text> : <>
      <Text style={{color:colors.text}}>{valueLabel} · {unit}</Text>
      <Svg width={width} height={205} accessibilityLabel={`Gráfico de ${valueLabel}. Os pontos também estão disponíveis nos botões abaixo.`}>
        {[min,(min+max)/2,max].map((value,index)=><React.Fragment key={index}><Line x1={42} x2={width-20} y1={155-index*62.5} y2={155-index*62.5} stroke={colors.border}/><SvgText x={0} y={159-index*62.5} fill={colors.textMuted} fontSize={10}>{Math.round(value)}</SvgText></React.Fragment>)}
        <Polyline points={points.map(point=>`${x(point)},${y(point)}`).join(" ")} stroke={colors.primary} strokeWidth={2} fill="none" />
        {points.map(point=><React.Fragment key={point._id}><Circle cx={x(point)} cy={y(point)} r={16} fill="transparent" onPress={()=>setSelected(String(point._id))}/><Circle cx={x(point)} cy={y(point)} r={selected===String(point._id)?7:4} fill={colors.primary} onPress={()=>setSelected(String(point._id))}/></React.Fragment>)}
        <SvgText x={42} y={185} fill={colors.textMuted} fontSize={10}>{new Date(start).toLocaleDateString("pt-BR")}</SvgText><SvgText x={width-20} y={199} textAnchor="end" fill={colors.textMuted} fontSize={10}>{new Date(end).toLocaleDateString("pt-BR")}</SvgText>
      </Svg>
      <ScrollView horizontal showsHorizontalScrollIndicator><View style={{flexDirection:"row",gap:8}}>{points.map(point=>chip(`${point[metric]} ${unit} · ${new Date(point.measuredAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`,selected===String(point._id),()=>setSelected(String(point._id)),point._id))}</View></ScrollView>
      {current ? <View accessibilityLiveRegion="polite" style={{padding:16,backgroundColor:colors.primaryLight,borderRadius:16,gap:7}}><Text style={{fontWeight:"700",color:colors.text,fontSize:20}}>{current[metric]} {unit}</Text><Text style={{color:colors.text}}>{timelineDate(current.measuredAt)}</Text><Text style={{color:colors.text}}>Origem: {measurementOrigin(current)}</Text>{current.note ? <Text style={{color:colors.textMuted}}>{current.note}</Text>:null}</View> : <Text style={{color:colors.textMuted}}>Selecione um ponto no gráfico ou na lista de valores.</Text>}
    </>}
    <Button title="Registrar medição manual" icon="plus" onPress={onRegister}/>
  </View>;
}
