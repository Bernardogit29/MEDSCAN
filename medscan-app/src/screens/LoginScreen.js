import { authColors as colors } from "../constants/authTheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { fontFamily } from "../constants/theme";

export default function LoginScreen({ navigation, route }) {
  const { login, loading } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    if (loading) {
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Informe e-mail e senha para continuar.");
      return;
    }

    setErrorMessage("");
    try {
      await login(email.trim().toLowerCase(), password);
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
    <AuthLayout title={"Seu cuidado\n"} accent="continua aqui." subtitle="Entre e retome de onde parou." navigation={navigation}>
        <View style={styles.form}>
          <AuthInput
            label="E-mail"
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
            placeholder="seuemail@exemplo.com"
          />
          <AuthInput
            label="Senha"
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            editable={!loading}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
            placeholder="Sua senha"
          />
          {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
          {loading ? <Text style={{ color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 }}>Conectando com segurança. O primeiro acesso pode levar até um minuto.</Text> : null}
          <AuthButton title="Entrar na minha conta" style={styles.submit} onPress={handleLogin} loading={loading} />

        </View>

        <View style={styles.linkRow}>
          <Text style={styles.linkHint}>Ainda não tem conta?</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Register")} style={styles.linkButton}><Text style={styles.link}>Criar conta</Text></Pressable>
        </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20
  },
  submit: { marginTop: 6 },
  error: { color: colors.danger, fontFamily, fontSize: 13, lineHeight: 21, padding: 12, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.danger },
  linkHint: { fontFamily, fontSize: 13, color: colors.textMuted },
  linkButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  linkRow: {
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 4
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
    fontFamily, fontSize: 13
  },
});
