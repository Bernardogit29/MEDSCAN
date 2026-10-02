import { Platform } from "react-native";

export const fontFamily = Platform.select({ web: "Segoe UI, Arial, sans-serif", ios: "System", default: "sans-serif" });
export const colors = {
  primary: "#075E52", primaryMedium: "#099D86", primaryLight: "#E3F6F0",
  text: "#173D36", textMuted: "#71847E", background: "#F5FAF8", surface: "#FFFFFF", white: "#FFFFFF",
  hero: "#075E52", heroHalo: "#0B806D", cta: "#DDFFF2", onCta: "#075E52",
  border: "#E3EEE9", danger: "#DC2626", warning: "#F59E0B", warningLight: "#FFF7E6",
  success: "#16A34A", successLight: "#DDF7E5", successText: "#11762D", info: "#1E88E5", purple: "#7E57C2",
  alertSurface: "#FFFAF1", alertBorder: "#F0DFBF", alertText: "#88552C", alertNumber: "#F8E8CA",
  selectedSurface: "#F1FBF8", switchOff: "#CBD9D4"
};
export const darkColors = {
  ...colors, primary: "#80E2C4", primaryMedium: "#58CDAE", primaryLight: "#0D3833",
  text: "#F0F5F4", textMuted: "#AABDB8", background: "#0B171B", surface: "#142328",
  hero: "#043A33", heroHalo: "#07594C", cta: "#ADFFE1", onCta: "#053C33",
  border: "#2C4145", danger: "#FF9292", warning: "#F6C56E", warningLight: "#382E1D",
  success: "#80E2C4", successLight: "#0D3833", successText: "#92E8C7", info: "#87BDFA", purple: "#C3ABF4",
  alertSurface: "#30281F", alertBorder: "#62503A", alertText: "#F5CA91", alertNumber: "#4C3B27",
  selectedSurface: "#123630", switchOff: "#40565A"
};
export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 10, md: 16, lg: 22, xl: 28 };
export const shadows = {
  card: { shadowColor: "#173D36", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.035, shadowRadius: 18, elevation: 1 },
  soft: { shadowColor: "#075E52", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 3 }
};
