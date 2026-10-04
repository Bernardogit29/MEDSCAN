import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useAppTheme } from "../context/ThemeContext";
import { fontFamily } from "../constants/theme";
import { displayDate, localDate } from "../utils/careRecords";

export default function VaccinationOverview({ records, unavailable = false }) {
  const { colors, styles } = useAppTheme(createStyles);
  const vaccines = records.filter(item => item.kind === "vaccine" && !item.archived);
  const received = vaccines.filter(item => item.status === "administered");
  const upcoming = vaccines.filter(item => (item.status === "planned" || item.nextDate) && (item.nextDate || item.date) >= localDate()).sort((a,b) => (a.nextDate || a.date).localeCompare(b.nextDate || b.date));
  return <View style={styles.section}>
    <LinearGradient colors={[colors.hero, colors.heroHalo]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.wallet}>
      <View style={styles.walletTop}><View style={{flex:1,gap:8}}><Text style={styles.overline}>CARTEIRA PESSOAL</Text><Text style={styles.title}>Seu histórico de proteção.</Text></View><MaterialCommunityIcons name="shield-check-outline" size={44} color="#B8F1DE" /></View>
      <View style={styles.stats}><View style={styles.stat}><Text style={styles.number}>{unavailable ? "—" : received.length}</Text><Text style={styles.statLabel}>doses registradas</Text></View><View style={styles.divider}/><View style={styles.stat}><Text style={styles.number}>{unavailable ? "—" : upcoming.length}</Text><Text style={styles.statLabel}>próximas datas</Text></View></View>
      <Text style={styles.walletNote}>Seus registros pessoais. A carteira oficial fica no Meu SUS Digital.</Text>
    </LinearGradient>
    <View style={styles.card}>
      <View style={styles.row}><MaterialCommunityIcons name="calendar-clock" size={22} color={colors.primary}/><Text style={styles.heading}>Próximas doses</Text></View>
      {unavailable ? <Text style={styles.note}>Carregue seus registros para consultar as próximas datas.</Text> : upcoming.length ? upcoming.map(record => <View key={record._id} style={styles.dose}>
        <View style={styles.date}><Text style={styles.day}>{displayDate(record.nextDate || record.date).slice(0,2)}</Text><Text style={styles.month}>{displayDate(record.nextDate || record.date).slice(3)}</Text></View>
        <View style={{flex:1,gap:5}}><Text style={styles.heading}>{record.name}</Text><Text style={styles.note}>{record.location || "Local não informado"}</Text><Text style={styles.tag}>Data informada por você</Text></View>
      </View>) : <View style={styles.empty}><MaterialCommunityIcons name="calendar-blank-outline" size={32} color={colors.textMuted}/><Text style={[styles.note,{flex:1}]}>Nenhuma próxima dose registrada.{"\n"}Adicione a data que consta na sua carteira.</Text></View>}
    </View>
    <View style={styles.card}>
      <Text style={styles.heading}>Acessos úteis</Text>
      {[
        ["cellphone", "Meu SUS Digital", "Consulte sua carteira oficial", "https://www.gov.br/saude/pt-br/composicao/seidigi/meususdigital"],
        ["calendar-month-outline", "Calendário nacional", "Informações do Ministério da Saúde", "https://www.gov.br/saude/pt-br/vacinacao/calendario"],
        ["map-marker-outline", "Vacinação em Contagem", "Informações nos canais da Prefeitura", "https://portal.contagem.mg.gov.br/imunizacao"]
      ].map(([icon,title,subtitle,url]) => <TouchableOpacity key={title} accessibilityRole="link" accessibilityLabel={title} onPress={() => Linking.openURL(url)} style={styles.resource}>
        <View style={styles.resourceIcon}><MaterialCommunityIcons name={icon} size={22} color={colors.primary}/></View><View style={{flex:1,gap:4}}><Text style={styles.resourceTitle}>{title}</Text><Text style={styles.note}>{subtitle}</Text></View><MaterialCommunityIcons name="arrow-top-right" size={20} color={colors.textMuted}/>
      </TouchableOpacity>)}
    </View>
  </View>;
}
const createStyles = colors => StyleSheet.create({
  section:{gap:16},wallet:{borderRadius:24,padding:24,gap:24},walletTop:{flexDirection:"row",gap:20,alignItems:"center"},overline:{fontFamily,fontSize:10,letterSpacing:2,color:"#B8F1DE",fontWeight:"700"},title:{fontFamily,fontSize:25,lineHeight:32,fontWeight:"700",color:"white"},
  stats:{flexDirection:"row",gap:24,alignItems:"center"},stat:{flex:1,gap:6},number:{fontFamily,fontSize:34,color:"white",fontWeight:"700"},statLabel:{fontFamily,fontSize:12,color:"#D6F1E7"},divider:{height:44,width:1,backgroundColor:"rgba(255,255,255,0.2)"},walletNote:{fontFamily,fontSize:11,lineHeight:18,color:"#D6F1E7"},
  card:{padding:20,gap:16,borderWidth:1,borderColor:colors.border,borderRadius:22,backgroundColor:colors.surface},row:{flexDirection:"row",gap:10,alignItems:"center"},heading:{fontFamily,fontSize:16,fontWeight:"700",color:colors.text},note:{fontFamily,fontSize:12,lineHeight:20,color:colors.textMuted},empty:{flexDirection:"row",alignItems:"center",gap:16,paddingVertical:12},
  dose:{flexDirection:"row",gap:16,alignItems:"center",paddingTop:16,borderTopWidth:1,borderTopColor:colors.border},date:{minWidth:70,padding:12,borderRadius:14,backgroundColor:colors.primaryLight,alignItems:"center",gap:3},day:{fontFamily,fontSize:23,color:colors.primary,fontWeight:"700"},month:{fontFamily,fontSize:10,color:colors.primary},tag:{fontFamily,fontSize:10,color:colors.primary},
  resource:{flexDirection:"row",gap:12,alignItems:"center",paddingTop:16,borderTopWidth:1,borderTopColor:colors.border},resourceIcon:{width:42,height:42,borderRadius:12,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center"},resourceTitle:{fontFamily,fontSize:13,fontWeight:"600",color:colors.text}
});
