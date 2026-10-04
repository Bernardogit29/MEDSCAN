import { authColors as colors } from "../constants/authTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthLayout from "../components/AuthLayout";
import AuthButton from "../components/AuthButton";
import { fontFamily } from "../constants/theme";

export default function WelcomeScreen({ navigation }) {
  return <AuthLayout welcome eyebrow="SEU PRÓXIMO PASSO COMEÇA AQUI" title={"Sua saúde,\n"} accent="em primeiro plano." subtitle="Entenda o que sente. Conecte seu histórico. Descubra um jeito mais simples de cuidar de você." navigation={navigation}>
    <View style={styles.features}>
    {[
      ["creation", "Orientação com IA"],
      ["clipboard-text-outline", "Prontuário"],
      ["heart-pulse", "Monitoramento"]
    ].map(([icon,title]) => <View key={title} style={styles.feature}><MaterialCommunityIcons name={icon} size={18} color={colors.primary} /><Text style={styles.label}>{title}</Text></View>)}
    </View>
    <View style={styles.actions}>
      <AuthButton title="Criar minha conta" onPress={() => navigation.navigate("Register")} />
      <AuthButton title="Já tenho uma conta" secondary onPress={() => navigation.navigate("Login")} />
    </View>
  </AuthLayout>;
}
const styles = StyleSheet.create({
  features: { flexDirection: "row", flexWrap: "wrap", columnGap: 20, rowGap: 14, paddingVertical: 4 },
  feature: { flexDirection: "row", alignItems: "center", gap: 7 },
  actions: { gap: 12, maxWidth: 400, width: "100%", marginTop: 6 },
  label: { fontFamily, fontSize: 11, color: colors.textMuted }
});
