import React from "react";
import { NavigationContainer, getPathFromState, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { useAppTheme } from "../context/ThemeContext";
import { publicNavigationState } from "../utils/navigationState";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import AnalyzeScreen from "../screens/AnalyzeScreen";
import ResultScreen from "../screens/ResultScreen";
import HistoryScreen from "../screens/HistoryScreen";
import MonitoringScreen from "../screens/MonitoringScreen";
import ProfileScreen from "../screens/ProfileScreen";
import NotificationsScreen from "../screens/NotificationsScreen";

import ConsultationSummaryScreen from "../screens/ConsultationSummaryScreen";

import CareScreen from "../screens/CareScreen";

const Stack = createNativeStackNavigator();
const pageTitles = {
  Care: "Cuidados e agenda",
  ConsultationSummary: "Resumo para consulta",
  Welcome: "Bem-vindo",
  Login: "Entrar",
  Register: "Criar conta",
  Home: "Início",
  Analyze: "Análise",
  Result: "Resultado da análise",
  History: "Prontuário",
  Monitoring: "Monitoramento",
  Profile: "Perfil",
  Notifications: "Notificações"
};

const linking = {
  getPathFromState: (state, options) => getPathFromState(publicNavigationState(state), options),
  prefixes: [],
  config: {
    screens: {
      Care: "cuidados",
      ConsultationSummary: "resumo-consulta",
      Welcome: "",
      Login: "login",
      Register: "cadastro",
      Home: "inicio",
      Analyze: "analise",
      Result: "resultado",
      History: "historico",
      Monitoring: "monitoramento",
      Profile: "perfil",
      Notifications: "notificacoes"
    }
  }
};

export default function AppNavigator() {
  const { colors, isDark } = useAppTheme();
  const base = isDark ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border, notification: colors.danger } };
  return (
    <NavigationContainer theme={theme} linking={linking} documentTitle={{
      formatter: (_options, route) => `${pageTitles[route?.name] || "Seu cuidado, mais perto"} | MEDSCAN`
    }}>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right"
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Analyze" component={AnalyzeScreen} />
        <Stack.Screen name="Care" component={CareScreen} />
        <Stack.Screen name="ConsultationSummary" component={ConsultationSummaryScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Monitoring" component={MonitoringScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
