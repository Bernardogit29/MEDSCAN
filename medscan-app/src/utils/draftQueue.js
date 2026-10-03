import { readDraft, writeDraft } from "./draftStorage";
const queues = new Map();
export async function loadDraft(key) {
  await queues.get(key)?.catch(() => {});
  return readDraft(key);
}
// Serialize writes across mounts, so an old save cannot resurrect a cleared draft.
export function saveDraft(key, value) {
  const pending = (queues.get(key) || Promise.resolve()).catch(() => {}).then(() => writeDraft(key, value));
  queues.set(key, pending);
  pending.finally(() => { if (queues.get(key) === pending) queues.delete(key); }).catch(() => {});
  return pending;
}
