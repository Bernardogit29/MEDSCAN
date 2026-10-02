import * as FileSystem from 'expo-file-system/legacy';
function themeFile() {
  if (!FileSystem.documentDirectory) throw new Error('Armazenamento indisponível');
  return `${FileSystem.documentDirectory}medscan-appearance.txt`;
}
export async function readTheme() {
  const file = themeFile();
  return (await FileSystem.getInfoAsync(file)).exists ? FileSystem.readAsStringAsync(file) : null;
}
export async function writeTheme(mode) { await FileSystem.writeAsStringAsync(themeFile(), mode); }
