import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../components/Button";
import Input from "../components/Input";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { fontFamily, colors } from "../constants/theme";

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleRegister() {
    if (!name || !age || !email || !password || !confirmPassword) {
      Alert.alert("Campos obrigatorios", "Preencha todos os campos para criar sua conta.");
      return;
    }

    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 120) {
      Alert.alert("Idade invalida", "Informe uma idade entre 0 e 120 anos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Senhas diferentes", "A confirmacao precisa ser igual a senha.");
      return;
    }

    setErrorMessage("");
    try {
      await register(name.trim(), email.trim(), numericAge, password);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (error) {
      setErrorMessage(error.message || "Não foi possível conectar. Tente novamente.");
    }
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Seu primeiro passo para cuidar melhor de você." navigation={navigation}>
          <View style={styles.form}>
            <Input label="Nome" icon="account-outline" value={name} onChangeText={setName} placeholder="Seu nome" />
            <Input
              label="Idade"
              icon="calendar-account-outline"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Sua idade"
            />
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
              placeholder="Crie uma senha"
            />
            <Input
              label="Confirmar senha"
              icon="lock-check-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Repita a senha"
            />
          {errorMessage ? <Text accessibilityRole="alert" style={{ color: colors.danger, fontFamily, lineHeight: 22 }}>{errorMessage}</Text> : null}
          {loading ? <Text style={{ color: colors.textMuted, fontFamily, fontSize: 13, lineHeight: 20 }}>Conectando com segurança. O primeiro acesso pode levar até um minuto.</Text> : null}
            <Button title="Criar conta" icon="account-check-outline" onPress={handleRegister} loading={loading} />
          </View>

          <Pressable onPress={() => navigation.navigate("Login")} style={styles.linkRow}>
            <MaterialCommunityIcons name="login" size={20} color={colors.primary} />
            <Text style={styles.link}>Ja tem conta? Fazer login</Text>
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
    flex: 1
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    gap: 28,
    paddingVertical: 24
  },
  top: {
    alignItems: "center",
    gap: 18
  },
  title: {
    color: colors.text,
    fontFamily, fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0
  },
  form: {
    gap: 15
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
  }
});
