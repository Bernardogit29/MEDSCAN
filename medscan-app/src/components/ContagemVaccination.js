import React from "react";
import { Linking, Text, View } from "react-native";
import { useAppTheme } from "../context/ThemeContext";
import Button from "./Button";

export default function ContagemVaccination() {
  const { colors } = useAppTheme();
  return <View style={{gap:12,marginTop:16}}>
    <Text style={{color:colors.text,fontSize:18,fontWeight:"700"}}>Vacinação em Contagem · MG</Text>
    <Text style={{color:colors.textMuted,lineHeight:21}}>Cidade padrão da apresentação. Consulte as próximas ações e os dias de aplicação diretamente nos canais da Prefeitura.</Text>
    <Button title="Programação e dias de aplicação nos postos" variant="outline" onPress={()=>Linking.openURL("https://portal.contagem.mg.gov.br/fomularios-sala-de-vacinacao")}/>
    <Text style={{color:colors.textMuted,fontSize:12,lineHeight:19}}>A página reúne a programação municipal. O documento de dias de aplicação consultado foi atualizado em 26/08/2026.</Text>
    <Button title="Campanhas e informações de imunização" variant="outline" onPress={()=>Linking.openURL("https://portal.contagem.mg.gov.br/imunizacao")}/>
    <Button title="Próximas ações no portal de Contagem" variant="outline" onPress={()=>Linking.openURL("https://portal.contagem.mg.gov.br/")}/>
    <Text style={{color:colors.textMuted,fontSize:12,lineHeight:19}}>Fontes: Prefeitura de Contagem · links conferidos em 03/10/2026. Não há consulta de estoque em tempo real nem reserva de vacina pelo app. Confirme data, público atendido e disponibilidade com a UBS.</Text>
  </View>;
}
