import { authColors as colors } from "../constants/authTheme";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import AuthButton from "../components/AuthButton";
import AuthInput from "../components/AuthInput";
import AuthLayout from "../components/AuthLayout";
import { validateRegistration } from "../utils/authValidation";
import { useAuth } from "../context/AuthContext";
import { fontFamily } from "../constants/theme";

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const { width } = useWindowDimensions();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister() {
    if (loading) return;
    const validation = validateRegistration({ name, age, email, password, confirmPassword });
    if (validation) { setErrorMessage(validation); return; }
    const numericAge = Number(age);

    setErrorMessage("");
    try {
      await register(name.trim(), email.trim().toLowerCase(), numericAge, password);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setErrorMessage(error.message || "Não foi possível conectar. Tente novamente.");
    }
  }

  return (
    <AuthLayout eyebrow="CRIE SEU ESPAÇO DE SAÚDE" title="Comece " accent="por você." subtitle="Uma conta. Seu cuidado todo conectado." navigation={navigation}>
          <View style={styles.form}>
            <View style={[styles.identityRow, width < 380 && styles.stackedRow]}>
            <AuthInput label="Nome" icon="account-outline" value={name} onChangeText={setName} placeholder="Seu nome" autoCapitalize="words" autoComplete="name" editable={!loading} style={[styles.nameField, width < 380 && styles.stackedField]} />
            <AuthInput
              label="Idade"
              icon="calendar-account-outline"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Anos"
              maxLength={3}
              editable={!loading}
              style={[styles.ageField, width < 380 && styles.stackedField]}
            />
            </View>
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
              autoComplete="new-password"
              editable={!loading}
              placeholder="Crie uma senha"
            />
            <Text style={styles.passwordHint}>Use pelo menos 8 caracteres.</Text>
            <AuthInput
              label="Confirmar senha"
              icon="lock-check-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="new-password"
              editable={!loading}
              returnKeyType="go"
              onSubmitEditing={handleRegister}
              placeholder="Repita a senha"
            />
          {errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{errorMessage}</Text> : null}
          {loading ? <Text style={{ color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 }}>Conectando com segurança. O primeiro acesso pode levar até um minuto.</Text> : null}
            <AuthButton title="Criar minha conta" style={styles.submit} onPress={handleRegister} loading={loading} />
          </View>

          <View style={styles.linkRow}>
            <Text style={styles.linkHint}>Já tem uma conta?</Text>
            <Pressable accessibilityRole="button" onPress={() => navigation.navigate("Login")} style={styles.linkButton}><Text style={styles.link}>Entrar</Text></Pressable>
          </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  identityRow: { flexDirection: "row", gap: 14 },
  stackedRow: { flexDirection: "column" },
  nameField: { flexGrow: 2, flexBasis: 0 },
  ageField: { flexGrow: 1, flexBasis: 0, minWidth: 105 },
  stackedField: { flexGrow: 0, flexBasis: "auto" },
  passwordHint: { color: colors.textMuted, fontFamily, fontSize: 11, lineHeight: 17, marginTop: -9 },
  submit: { marginTop: 4 },
  error: { color: colors.danger, fontFamily, fontSize: 13, lineHeight: 21, padding: 12, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.danger },
  linkHint: { fontFamily, fontSize: 13, color: colors.textMuted },
  linkButton: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  form: {
    gap: 15
  },
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
  }
});
