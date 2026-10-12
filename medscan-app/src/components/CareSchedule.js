import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { fontFamily } from "../constants/theme";
import { localDate, medicationAgenda, careStatuses } from "../utils/careRecords";
import { calendarDate, monthCells, shiftDay, shiftMonth } from "../utils/careCalendar";
import AppointmentNotes from "./AppointmentNotes";

const weekdays = ["DOM","SEG","TER","QUA","QUI","SEX","SÁB"];

export default function CareSchedule({ kind, records, doses, onTaken, onEdit, busy, unavailable=false, initialDate }) {
  const { colors, styles } = useAppTheme(createStyles);
  const startDate = initialDate && /^\d{4}-\d{2}-\d{2}$/.test(initialDate) && localDate(calendarDate(initialDate)) === initialDate ? initialDate : localDate();
  const [selected,setSelected] = useState(startDate), [period,setPeriod] = useState(startDate);
  const appointments = kind === "appointment";
  const currentDate = calendarDate(selected);
  const visibleDates = appointments ? monthCells(period) : Array.from({length:7},(_,index)=>shiftDay(period,index));
  const daysWithVisits = new Set(records.filter(record=>record.kind==="appointment" && !record.archived && record.status!=="cancelled").map(record=>record.date));
  const agenda = medicationAgenda(records,doses,selected);
  const visits = records.filter(record=>record.kind==="appointment" && !record.archived && record.date===selected).sort((a,b)=>(a.time || "").localeCompare(b.time || ""));
  const count = appointments ? visits.length : agenda.length;
  function move(offset) { const date = appointments ? shiftMonth(period,offset) : shiftDay(period,offset*7); setPeriod(date);setSelected(date); }
  function today() { const date=localDate();setPeriod(date);setSelected(date); }
  return <View style={styles.section}>
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <View style={{flex:1,gap:5}}><Text style={styles.overline}>{appointments?"SUA AGENDA":"SUA ROTINA"}</Text><Text style={styles.monthTitle}>{calendarDate(period).toLocaleDateString("pt-BR",{month:"long",year:"numeric"})}</Text></View>
        <TouchableOpacity accessibilityRole="button" onPress={today} style={styles.today}><Text style={styles.todayText}>Hoje</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={appointments?"Mês anterior":"Semana anterior"} onPress={()=>move(-1)} style={styles.arrow}><MaterialCommunityIcons name="chevron-left" size={24} color={colors.primary}/></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={appointments?"Próximo mês":"Próxima semana"} onPress={()=>move(1)} style={styles.arrow}><MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary}/></TouchableOpacity>
      </View>
      {appointments ? <>
        <View style={styles.weekLabels}>{weekdays.map(day=><Text key={day} style={styles.weekLabel}>{day}</Text>)}</View>
        <View style={styles.monthGrid}>{visibleDates.map((date,index)=><View key={date || `blank-${index}`} style={styles.dayCell}>{date ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`${calendarDate(date).toLocaleDateString("pt-BR")}${daysWithVisits.has(date)?", com consulta":""}`} accessibilityState={{selected:date===selected}} onPress={()=>setSelected(date)} style={[styles.monthDay,date===localDate() && styles.currentDay,date===selected && styles.selectedDay]}><Text style={[styles.dayNumber,date===selected && styles.selectedText]}>{calendarDate(date).getDate()}</Text><View style={[styles.dot,daysWithVisits.has(date) && {backgroundColor:date===selected?"#FFFFFF":colors.primary}]}/></TouchableOpacity>:null}</View>)}</View>
        <View style={styles.legend}><View style={[styles.dot,{backgroundColor:colors.primary}]}/><Text style={styles.note}>Dia com consulta</Text></View>
      </> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekStrip}>{visibleDates.map(date=><TouchableOpacity key={date} accessibilityRole="button" accessibilityLabel={calendarDate(date).toLocaleDateString("pt-BR")} accessibilityState={{selected:date===selected}} onPress={()=>setSelected(date)} style={[styles.weekDay,date===localDate() && styles.currentDay,date===selected && styles.selectedDay]}><Text style={[styles.dayLabel,date===selected && styles.selectedText]}>{weekdays[calendarDate(date).getDay()]}</Text><Text style={[styles.weekNumber,date===selected && styles.selectedText]}>{calendarDate(date).getDate()}</Text><View style={[styles.dot,{backgroundColor:medicationAgenda(records,[],date).length?(date===selected?"#FFFFFF":colors.primary):"transparent"}]}/></TouchableOpacity>)}</ScrollView>}
    </View>
    <View style={styles.sectionHeading}><View style={{flex:1,gap:5}}><Text style={styles.heading}>{appointments?"Consultas do dia":"Medicamentos do dia"}</Text><Text style={styles.note}>{currentDate.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})}</Text></View><Text style={styles.count}>{count} {appointments?(count===1?"consulta":"consultas"):(count===1?"horário":"horários")}</Text></View>
    {unavailable?<Text style={styles.note}>Carregue seus registros para consultar este dia.</Text>:!count?<View style={styles.empty}><MaterialCommunityIcons name={appointments?"calendar-check-outline":"pill"} size={28} color={colors.primary}/><Text style={styles.note}>{appointments?"Nenhuma consulta nesta data.":"Nenhum medicamento programado para este dia."}</Text></View>:appointments?visits.map(record=><View key={record._id} style={styles.scheduleCard}>
      <View style={styles.timeBlock}><MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary}/><Text style={styles.time}>{record.time || "—"}</Text></View>
      <View style={styles.cardBody}><View style={styles.titleRow}><Text style={styles.name}>{record.name}</Text><Text style={styles.status}>{careStatuses[record.status]}</Text></View><Text style={styles.note}>{record.location || "Local não informado"}</Text><AppointmentNotes record={record}/>{record.notes?<Text style={styles.note}>{record.notes}</Text>:null}{!record.preview?<TouchableOpacity accessibilityRole="button" onPress={()=>onEdit(record)} style={styles.smallAction}><Text style={styles.actionText}>Preparar e anotar</Text><MaterialCommunityIcons name="arrow-top-right" size={16} color={colors.primary}/></TouchableOpacity>:null}</View>
    </View>):agenda.map(item=><View key={`${item.record._id}:${item.time}`} style={[styles.scheduleCard,item.taken && styles.takenCard]}>
      <View style={styles.timeBlock}><MaterialCommunityIcons name={Number(item.time.slice(0,2))<18?"weather-sunny":"weather-night"} size={20} color={colors.primary}/><Text style={styles.time}>{item.time}</Text></View>
      <View style={styles.cardBody}><Text style={styles.name}>{item.record.name}</Text><Text style={styles.note}>{item.record.dose || "Dose não informada"}</Text>
        {item.taken?<View style={styles.smallAction}><MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary}/><Text style={styles.actionText}>Tomada registrada</Text></View>:selected<=localDate()?<TouchableOpacity accessibilityRole="button" accessibilityLabel={`Registrar tomada de ${item.record.name} às ${item.time}`} disabled={Boolean(busy)} onPress={()=>onTaken(item)} style={styles.smallAction}><MaterialCommunityIcons name="circle-outline" size={19} color={colors.primary}/><Text style={styles.actionText}>Marcar como tomado</Text></TouchableOpacity>:<Text style={styles.status}>Programado</Text>}
      </View>
    </View>)}
  </View>;
}
const createStyles=colors=>StyleSheet.create({
  section:{gap:16},calendar:{padding:18,borderRadius:22,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,gap:20},calendarHeader:{flexDirection:"row",alignItems:"center",gap:6},overline:{fontFamily,fontSize:9,letterSpacing:1.8,color:colors.textMuted,fontWeight:"700"},monthTitle:{fontFamily,fontSize:17,lineHeight:24,color:colors.text,fontWeight:"700",textTransform:"capitalize"},today:{paddingHorizontal:9,minHeight:40,justifyContent:"center"},todayText:{fontFamily,fontSize:11,color:colors.primary,fontWeight:"700"},arrow:{width:34,height:40,alignItems:"center",justifyContent:"center"},
  weekStrip:{gap:10,flexGrow:1},weekDay:{minWidth:57,flexGrow:1,paddingVertical:15,paddingHorizontal:10,borderRadius:16,alignItems:"center",gap:10,backgroundColor:colors.background,borderWidth:1,borderColor:"transparent"},dayLabel:{fontFamily,fontSize:10,color:colors.textMuted,fontWeight:"600"},weekNumber:{fontFamily,fontSize:24,color:colors.text,fontWeight:"700"},currentDay:{borderColor:colors.primaryMedium},selectedDay:{backgroundColor:colors.hero,borderColor:colors.hero},selectedText:{color:"white"},dot:{width:5,height:5,borderRadius:3,backgroundColor:"transparent"},
  weekLabels:{flexDirection:"row"},weekLabel:{width:"14.285714%",textAlign:"center",fontFamily,fontSize:9,fontWeight:"600",color:colors.textMuted},monthGrid:{flexDirection:"row",flexWrap:"wrap",rowGap:6},dayCell:{width:"14.285714%",paddingHorizontal:2,minHeight:49},monthDay:{minHeight:49,alignItems:"center",justifyContent:"center",gap:5,borderRadius:12,borderWidth:1,borderColor:"transparent"},dayNumber:{fontFamily,fontSize:14,color:colors.text,fontWeight:"600"},legend:{flexDirection:"row",alignItems:"center",gap:8},
  sectionHeading:{flexDirection:"row",gap:12,alignItems:"center",marginTop:6},heading:{fontFamily,fontSize:17,color:colors.text,fontWeight:"700"},note:{fontFamily,fontSize:12,lineHeight:19,color:colors.textMuted},count:{fontFamily,fontSize:11,color:colors.primary,backgroundColor:colors.primaryLight,padding:9,borderRadius:10},
  scheduleCard:{flexDirection:"row",borderRadius:20,borderWidth:1,borderColor:colors.border,backgroundColor:colors.surface,overflow:"hidden"},timeBlock:{width:80,paddingVertical:20,alignItems:"center",gap:8,backgroundColor:colors.primaryLight},time:{fontFamily,fontSize:17,color:colors.primary,fontWeight:"700"},cardBody:{flex:1,padding:18,gap:8},name:{fontFamily,fontSize:16,lineHeight:22,color:colors.text,fontWeight:"700",flexShrink:1},titleRow:{flexDirection:"row",flexWrap:"wrap",gap:8,alignItems:"center",justifyContent:"space-between"},status:{fontFamily,fontSize:10,color:colors.primary,fontWeight:"600"},smallAction:{flexDirection:"row",alignItems:"center",gap:8,minHeight:38,alignSelf:"flex-start"},actionText:{fontFamily,fontSize:12,color:colors.primary,fontWeight:"600"},takenCard:{borderColor:colors.primaryMedium},empty:{padding:24,borderRadius:20,backgroundColor:colors.surface,alignItems:"center",gap:14,borderWidth:1,borderColor:colors.border}
});
