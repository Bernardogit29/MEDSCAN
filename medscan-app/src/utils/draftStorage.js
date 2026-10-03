let database;
function open() {
  if (!database) database = new Promise((resolve, reject) => {
    const request = indexedDB.open("medscan-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => { database = null; reject(request.error); };
  });
  return database;
}
async function transaction(key, value, write) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("drafts", write ? "readwrite" : "readonly");
    const store = tx.objectStore("drafts");
    const request = write ? value === null ? store.delete(key) : store.put(value, key) : store.get(key);
    tx.oncomplete = () => resolve(request.result || null);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Rascunho não salvo"));
  });
}
export const readDraft = key => transaction(key, null, false);
export const writeDraft = (key, value) => transaction(key, value, true);
export async function durableAttachment(asset) {
  const blob = await (await fetch(asset.uri)).blob();
  const uri = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  return { uri, fileName: asset.fileName, mimeType: asset.mimeType || blob.type };
}
export const releaseAttachment = async () => {};
