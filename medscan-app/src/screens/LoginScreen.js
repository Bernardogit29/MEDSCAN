import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import Input from "../components/Input";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { fontFamily, colors } from "../constants/theme";

export default function LoginScreen({ navigation, route }) {
  const { login, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (loading) {
      return;
    }

    if (!email || !password) {
      Alert.alert("Campos obrigatorios", "Informe e-mail e senha para continuar.");
      return;
    }

    setErrorMessage("");
    try {
      await login(email.trim(), password);
      if (route.params?.returnToPrevious && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (error) {
      setErrorMessage(error.message || "Não foi possível conectar. Tente novamente.");
    }
  }

  return (
    <AuthLayout title="Entrar na sua conta" subtitle="Acesse seu histórico e continue seu cuidado." navigation={navigation}>
        <View style={styles.form}>
          <Input
            label="E-mail"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="seuemail@exemplo.com"
          />
          <Input
            label="Senha"
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Sua senha"
          />
          {errorMessage ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontFamily, lineHeight: 22 }}>{errorMessage}</Text> : null}
          {loading ? <Text style={{ color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 }}>Conectando com segurança. O primeiro acesso pode levar até um minuto.</Text> : null}
          <Button title="Entrar" icon="login" onPress={handleLogin} loading={loading} />
          <Button
            title="Entrar com Google"
            icon="google"
            variant="outline"
            onPress={() => Alert.alert("Google", "Botao visual preparado para autenticacao futura.")}
          />
        </View>

        <Pressable onPress={() => navigation.navigate("Register")} style={styles.linkRow}>
          <MaterialCommunityIcons name="account-plus-outline" size={20} color={colors.primary} />
          <Text style={styles.link}>Ainda nao tem conta? Cadastre-se</Text>
        </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24
  },
  keyboard: {
    flex: 1,
    justifyContent: "center",
    gap: 34
  },
  top: {
    alignItems: "center",
    gap: 20
  },
  title: {
    color: colors.text,
    fontFamily, fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0
  },
  form: {
    gap: 16
  },
  linkRow: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontFamily, fontSize: 15
  },
});
