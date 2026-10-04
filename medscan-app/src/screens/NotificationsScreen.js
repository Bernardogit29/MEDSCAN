import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDesktop, desktopPage, desktopContent } from "../utils/responsive";
import { fontFamily } from "../constants/theme";
import api from "../api/client";
import BottomTab from "../components/BottomTab";
import Button from "../components/Button";

function dateGroup(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Data não informada";
  const today = new Date(), yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === yesterday.toDateString()) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

export default function NotificationsScreen({ navigation }) {
  const { colors, styles } = useAppTheme(createStyles), desktop = useDesktop(), { token } = useAuth();
  const [items,setItems] = useState([]), [state,setState] = useState("loading");
  const [revision,setRevision] = useState(0), [filter,setFilter] = useState("all");
  useFocusEffect(useCallback(() => {
    let active = true;
    setItems([]);
    setState(token ? "loading" : "guest");
    async function load() {
      try {
        const { data } = await api.get("/profile");
        if (!active) return;
        const settings = data.profile?.settings || {};
        if (settings.notifications === false) { setState("disabled"); return; }
        const response = await api.get("/history?personId=self");
        if (!active) return;
        if (!Array.isArray(response.data)) throw new Error("Invalid history");
        const records = [...response.data].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,20);
        setItems(records.map(item => ({
          id: item._id, createdAt: item.createdAt, analysis: item,
          title: item.type === "symptoms" ? "Análise do seu relato" : "Análise de exame",
          description: settings.appPreferences?.hideHealthPreviews ? "Seu registro está pronto para consultar." : item.possibleCondition || "Seu resultado está disponível no prontuário."
        })));
        setState(records.length ? "ready" : "empty");
      } catch (_) { if (active) setState("error"); }
    }
    if (token) load();
    return () => { active = false; };
  }, [token,revision]));
  const groups = useMemo(() => {
    const filtered = items.filter(item => filter === "all" || Date.parse(item.createdAt) >= Date.now() - 7*86400000);
    return filtered.reduce((result,item) => {
      const label = dateGroup(item.createdAt);
      let group = result.find(group => group.label === label);
      if (!group) { group = { label, items: [] }; result.push(group); }
      group.items.push(item);
      return result;
    }, []);
  }, [items,filter]);
  const visibleCount=groups.reduce((count,group)=>count+group.items.length,0);
  const messages = {
    guest: ["Entre para acompanhar", "Suas atualizações ficam reunidas aqui depois que você entra na conta.", "account-outline"],
    disabled: ["Você pausou as atualizações", "Reative as notificações nas configurações do seu perfil.", "bell-off-outline"],
    error: ["Não conseguimos carregar", "Tente novamente para consultar suas atualizações.", "cloud-alert"],
    empty: ["Tudo tranquilo por aqui", "Quando uma análise for salva, você poderá acessar o resultado por aqui.", "bell-check-outline"],
    filtered: ["Nenhuma atualização nesta semana", "Selecione Todas para consultar os registros anteriores.", "calendar-check-outline"]
  };
  const empty = messages[state === "ready" && !groups.length ? "filtered" : state];
  return <SafeAreaView style={[styles.safe,desktop && desktopPage]}>
    <ScrollView contentContainerStyle={[styles.content,desktop && desktopContent]} showsVerticalScrollIndicator={false}>
      <View style={styles.topbar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")} style={styles.iconButton}><MaterialCommunityIcons name="arrow-left" size={22} color={colors.text}/></TouchableOpacity>
        <View style={styles.topActions}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Atualizar notificações" disabled={state === "loading" || !token} onPress={() => setRevision(value=>value+1)} style={styles.iconButton}><MaterialCommunityIcons name="refresh" size={21} color={colors.primary}/></TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Configurar notificações no perfil" onPress={() => navigation.navigate("Profile")} style={styles.iconButton}><MaterialCommunityIcons name="cog-outline" size={21} color={colors.primary}/></TouchableOpacity>
        </View>
      </View>
      <View style={styles.headingRow}>
        <View style={{flex:1,gap:9}}><Text style={styles.eyebrow}>SEU CUIDADO EM DIA</Text><Text accessibilityRole="header" style={styles.pageTitle}>Notificações</Text><Text style={styles.subtitle}>As novidades do seu cuidado, sem perder nada de vista.</Text></View>
        <View style={styles.bell}><MaterialCommunityIcons name="bell-outline" size={30} color={colors.primary}/></View>
      </View>
      <View style={styles.toolbar}>
        <View style={styles.filters}>{[["all","Todas"],["week","Últimos 7 dias"]].map(([key,label]) => <TouchableOpacity key={key} accessibilityRole="button" accessibilityState={{selected:filter===key}} onPress={() => setFilter(key)} style={[styles.filter,filter===key && styles.filterActive]}><Text style={[styles.filterLabel,filter===key && styles.filterLabelActive]}>{label}</Text></TouchableOpacity>)}</View>
        <Text style={styles.count}>{visibleCount} {visibleCount===1?"atualização":"atualizações"}</Text>
      </View>
      {state === "loading" ? <View style={styles.empty}><ActivityIndicator color={colors.primary}/><Text style={styles.subtitle}>Buscando suas atualizações…</Text></View> : empty ? <View style={styles.empty}>
        <View style={styles.emptyIcon}><MaterialCommunityIcons name={empty[2]} size={36} color={colors.primary}/></View><Text style={styles.emptyTitle}>{empty[0]}</Text><Text style={styles.emptyCopy}>{empty[1]}</Text>
        {state === "guest" ? <Button title="Entrar na conta" onPress={() => navigation.navigate("Login",{returnToPrevious:true})}/> : state === "error" ? <Button title="Tentar novamente" onPress={() => setRevision(value=>value+1)}/> : state === "disabled" ? <Button title="Abrir configurações" onPress={() => navigation.navigate("Profile")}/> : null}
      </View> : groups.map(group => <View key={group.label} style={styles.group}>
        <Text style={styles.groupLabel}>{group.label}</Text>
        <View style={styles.groupCard}>{group.items.map((item,index) => <TouchableOpacity key={item.id} accessibilityRole="button" accessibilityLabel={`Abrir ${item.title}: ${item.description}`} onPress={() => navigation.navigate("Result",{analysis:item.analysis})} activeOpacity={0.75} style={[styles.item,index>0 && styles.itemBorder]}>
          <View style={styles.itemIcon}><MaterialCommunityIcons name={item.analysis.type==="symptoms"?"text-box-check-outline":"file-check-outline"} size={22} color={colors.primary}/></View>
          <View style={styles.itemCopy}><View style={styles.itemHeading}><Text style={styles.itemTitle}>{item.title}</Text><Text style={styles.time}>{Number.isFinite(Date.parse(item.createdAt))?new Date(item.createdAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}):""}</Text></View><Text style={styles.description} numberOfLines={2}>{item.description}</Text><Text style={styles.resultLink}>Ver resultado</Text></View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textMuted}/>
        </TouchableOpacity>)}</View>
      </View>)}
      <View style={styles.footer}><MaterialCommunityIcons name="information-outline" size={16} color={colors.textMuted}/><Text style={styles.footerText}>Até 20 análises recentes. Gerencie suas preferências no ícone de configurações.</Text></View>
    </ScrollView>
    <BottomTab navigation={navigation} active="Notifications"/>
  </SafeAreaView>;
}
const createStyles = colors => StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.background},content:{padding:22,paddingBottom:130,gap:26,width:"100%",maxWidth:820,alignSelf:"center"},
  topbar:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},topActions:{flexDirection:"row",gap:8},iconButton:{width:44,height:44,borderRadius:14,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,alignItems:"center",justifyContent:"center"},
  headingRow:{flexDirection:"row",gap:16,alignItems:"center"},eyebrow:{fontFamily,fontSize:9,letterSpacing:1.8,fontWeight:"700",color:colors.primary},pageTitle:{fontFamily,fontSize:32,lineHeight:39,fontWeight:"700",letterSpacing:-1,color:colors.text},subtitle:{fontFamily,fontSize:13,lineHeight:21,color:colors.textMuted},
  bell:{width:58,height:58,borderRadius:20,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center"},toolbar:{flexDirection:"row",flexWrap:"wrap",gap:14,alignItems:"center",justifyContent:"space-between"},filters:{flexDirection:"row",gap:5,padding:4,backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:14},
  filter:{paddingHorizontal:14,paddingVertical:10,borderRadius:10},filterActive:{backgroundColor:colors.primaryLight},filterLabel:{fontFamily,fontSize:12,color:colors.textMuted},filterLabelActive:{color:colors.primary,fontWeight:"700"},count:{fontFamily,fontSize:11,color:colors.textMuted},
  group:{gap:12},groupLabel:{fontFamily,fontSize:12,fontWeight:"700",color:colors.textMuted},groupCard:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,overflow:"hidden"},
  item:{padding:18,flexDirection:"row",alignItems:"center",gap:12},itemBorder:{borderTopWidth:1,borderTopColor:colors.border},itemIcon:{width:42,height:42,borderRadius:13,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center"},
  itemCopy:{flex:1,minWidth:0,gap:6},itemHeading:{flexDirection:"row",flexWrap:"wrap",gap:6,justifyContent:"space-between",alignItems:"center"},itemTitle:{fontFamily,fontSize:14,lineHeight:20,fontWeight:"700",color:colors.text},time:{fontFamily,fontSize:10,color:colors.textMuted},description:{fontFamily,fontSize:12,lineHeight:20,color:colors.textMuted},resultLink:{fontFamily,fontSize:11,color:colors.primary,fontWeight:"600",marginTop:2},
  empty:{padding:28,alignItems:"center",gap:16,backgroundColor:colors.surface,borderRadius:22,borderWidth:1,borderColor:colors.border},emptyIcon:{width:76,height:76,borderRadius:26,backgroundColor:colors.primaryLight,alignItems:"center",justifyContent:"center"},emptyTitle:{fontFamily,fontSize:19,lineHeight:26,fontWeight:"700",color:colors.text,textAlign:"center"},emptyCopy:{fontFamily,fontSize:13,lineHeight:22,color:colors.textMuted,textAlign:"center",maxWidth:360},
  footer:{flexDirection:"row",gap:8,alignItems:"flex-start"},footerText:{fontFamily,fontSize:11,lineHeight:18,color:colors.textMuted,flex:1}
});
