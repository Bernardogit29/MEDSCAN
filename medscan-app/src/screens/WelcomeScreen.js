import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { colors } from "../constants/theme";

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backgroundCrossTop} />
      <View style={styles.backgroundCrossBottom} />
      <View style={styles.content}>
        <Logo />
      </View>
      <View style={styles.actions}>
        <Button
          title="Cadastrar"
          icon="account-plus-outline"
          onPress={() => navigation.navigate("Register")}
        />
        <Button
          title="Login"
          icon="login"
          variant="outline"
          onPress={() => navigation.navigate("Login")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 26
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  actions: {
    gap: 18,
    paddingBottom: 42
  },
  backgroundCrossTop: {
    position: "absolute",
    top: 36,
    right: -42,
    width: 150,
    height: 150,
    borderRadius: 40,
    backgroundColor: "rgba(223,244,239,0.72)",
    transform: [{ rotate: "45deg" }]
  },
  backgroundCrossBottom: {
    position: "absolute",
    left: -44,
    bottom: 168,
    width: 130,
    height: 130,
    borderRadius: 34,
    backgroundColor: "rgba(223,244,239,0.62)",
    transform: [{ rotate: "45deg" }]
  }
});
