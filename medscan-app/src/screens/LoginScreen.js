import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import Input from "../components/Input";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { colors } from "../constants/theme";

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
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

    try {
      await login(email.trim(), password);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      const fallbackMessage = error.response
        ? "Confira suas credenciais e tente novamente."
        : "Nao foi possivel conectar ao servidor. Verifique se a API esta rodando e tente novamente.";

      Alert.alert(
        "Nao foi possivel entrar",
        error.response?.data?.message || fallbackMessage
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboard}
      >
        <View style={styles.top}>
          <Logo compact />
          <Text style={styles.title}>Entrar na sua conta</Text>
        </View>

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
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    fontSize: 26,
    fontWeight: "900",
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
    fontWeight: "900",
    fontSize: 15
  },
});
