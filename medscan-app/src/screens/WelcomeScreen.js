import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import { colors, fontFamily } from "../constants/theme";

export default function WelcomeScreen({ navigation }) {
  return <AuthLayout title="Seu cuidado, mais perto." subtitle="Entenda seus sintomas e acompanhe sua saúde." navigation={navigation}>
    <Text style={styles.title}>Bem-vindo ao MEDSCAN</Text>
    {[
      ["creation", "Orientação com IA", "Conte o que sente e entenda os próximos passos."],
      ["clipboard-text-outline", "Seu prontuário", "Mantenha suas análises e exames organizados."],
      ["heart-pulse", "Tudo em um só lugar", "Acompanhe seu histórico de cuidado."]
    ].map(([icon,title,description]) => <View key={title} style={styles.row}><View style={styles.icon}><MaterialCommunityIcons name={icon} size={22} color={colors.primary} /></View><View style={styles.copy}><Text style={styles.label}>{title}</Text><Text style={styles.description}>{description}</Text></View></View>)}
    <Button title="Entrar na minha conta" onPress={() => navigation.navigate("Login")} />
    <Button title="Criar conta" variant="outline" onPress={() => navigation.navigate("Register")} />
  </AuthLayout>;
}
const styles = StyleSheet.create({
  title: { fontFamily, fontSize: 21, color: colors.text, fontWeight: "700" },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.primaryLight, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1 },
  label: { fontFamily, fontSize: 15, fontWeight: "600", color: colors.text },
  description: { fontFamily, fontSize: 13, color: colors.textMuted, lineHeight: 20, marginTop: 4 }
});
