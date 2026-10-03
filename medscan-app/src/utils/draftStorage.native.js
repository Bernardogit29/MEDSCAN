import * as FileSystem from "expo-file-system/legacy";
function path(key) {
  if (!FileSystem.documentDirectory) throw new Error("Armazenamento indisponível");
  return `${FileSystem.documentDirectory}medscan-draft-${encodeURIComponent(key)}.json`;
}
export async function readDraft(key) {
  const file = path(key);
  if (!(await FileSystem.getInfoAsync(file)).exists) return null;
  return JSON.parse(await FileSystem.readAsStringAsync(file));
}
export async function writeDraft(key, value) {
  const file = path(key);
  if (value === null) return FileSystem.deleteAsync(file, { idempotent: true });
  const temporary = `${file}.tmp`;
  await FileSystem.writeAsStringAsync(temporary, JSON.stringify(value));
  await FileSystem.moveAsync({ from: temporary, to: file });
}
export async function durableAttachment(asset) {
  const extension = /\.(png|jpe?g|webp|heic)$/i.exec(asset.fileName || asset.uri)?.[1] || "jpg";
  const uri = `${FileSystem.documentDirectory}medscan-attachment-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  await FileSystem.copyAsync({ from: asset.uri, to: uri });
  return { uri, fileName: asset.fileName, mimeType: asset.mimeType };
}
export async function releaseAttachment(asset) {
  if (asset?.uri?.startsWith(`${FileSystem.documentDirectory}medscan-attachment-`)) {
    await FileSystem.deleteAsync(asset.uri, { idempotent: true });
  }
}
