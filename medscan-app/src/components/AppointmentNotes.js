import React from "react";
import { Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import { fontFamily } from "../constants/theme";

export default function AppointmentNotes({ record }) {
  const { colors } = useAppTheme();
  const fields = [["professional", "Profissional"], ["questions", "Perguntas para a consulta"],
    ["documents", "Documentos para levar"], ["instructions", "Orientações recebidas"]];
  return <View style={{gap:10}}>{fields.filter(([key])=>record[key]).map(([key,label])=><View key={key} style={{gap:3}}>
    <Text style={{fontFamily,fontSize:11,fontWeight:"700",color:colors.primary}}>{label}</Text>
    <Text style={{fontFamily,fontSize:12,lineHeight:19,color:colors.textMuted}}>{record[key]}</Text>
  </View>)}</View>;
}
