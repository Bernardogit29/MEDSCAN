import { Platform } from "react-native";

export const fontFamily = Platform.select({ web: "Segoe UI, Arial, sans-serif", ios: "System", default: "sans-serif" });

export const colors = {
  primary: "#075E52",
  primaryMedium: "#099D86",
  primaryLight: "#E3F6F0",
  text: "#173D36",
  textMuted: "#71847E",
  background: "#F5FAF8",
  white: "#FFFFFF",
  border: "#E3EEE9",
  danger: "#DC2626",
  warning: "#F59E0B",
  warningLight: "#FFF7E6",
  success: "#16A34A",
  info: "#1E88E5",
  purple: "#7E57C2"
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28
};

export const shadows = {
  card: {
    shadowColor: "#173D36",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.035,
    shadowRadius: 18,
    elevation: 1
  },
  soft: {
    shadowColor: "#075E52",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 3
  }
};
