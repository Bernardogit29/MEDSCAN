import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors, radius } from "../constants/theme";

export const medicalNoticeText =
  "Esta análise não substitui uma consulta médica. Em caso de urgência, procure atendimento imediatamente.";

export default function MedicalNotice({ title = "Aviso importante" }) {
  return (
    <View style={styles.notice}>
      <MaterialCommunityIcons name="shield-check-outline" size={42} color={colors.primary} />
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.text}>{medicalNoticeText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  copy: {
    flex: 1,
    gap: 4
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  text: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600"
  }
});
