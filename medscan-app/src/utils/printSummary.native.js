import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
export async function printSummary(html) {
  if (!(await Sharing.isAvailableAsync())) { await Print.printAsync({ html }); return; }
  const { uri } = await Print.printToFileAsync({ html });
  try { await Sharing.shareAsync(uri, { mimeType: "application/pdf", UTI: "com.adobe.pdf", dialogTitle: "Salvar ou compartilhar resumo" }); }
  finally { await FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => {}); }
}
