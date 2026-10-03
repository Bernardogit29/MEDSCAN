import { useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft } from "./draftQueue";
export default function useAnalysisDraft(key, initial) {
  const current = useRef({ key: undefined, value: initial });
  const [snapshot, setSnapshot] = useState(current.current);
  const [notice, setNotice] = useState("");
  const serial = useRef(0);
  useEffect(() => {
    let active = true;
    setNotice("");
    const start = async () => {
      let value = initial;
      try {
        if (key) {
          const saved = await loadDraft(key);
          // An unsent guest form can continue after login; account drafts never cross accounts.
          const guest = current.current.key === null && current.current.value.updatedAt ? current.current.value : null;
          value = saved || guest || initial;
          if (!saved && guest) await saveDraft(key, guest);
          if (active && (saved || guest)) setNotice("Rascunho recuperado deste dispositivo.");
        }
        if (value.status === "submitting") value = { ...value, status: "interrupted" };
      } catch { if (active) setNotice("Não foi possível recuperar o rascunho deste dispositivo."); }
      if (active) { current.current = { key, value }; setSnapshot(current.current); }
    };
    start();
    return () => { active = false; };
  }, [key]);
  const ready = snapshot.key === key;
  function update(patch) {
    if (current.current.key !== key) return Promise.resolve(false);
    const value = { ...current.current.value, ...patch, updatedAt: new Date().toISOString() };
    current.current = { key, value }; setSnapshot(current.current);
    const revision = ++serial.current;
    if (!key) { setNotice("Entre na sua conta para salvar o rascunho neste dispositivo."); return Promise.resolve(false); }
    setNotice("Salvando rascunho…");
    return saveDraft(key, value).then(() => {
      if (current.current.key === key && serial.current === revision) setNotice("Rascunho salvo neste dispositivo.");
      return true;
    }).catch(() => {
      if (current.current.key === key && serial.current === revision) setNotice("Não foi possível salvar. Mantenha esta tela aberta para não perder o relato.");
      return false;
    });
  }
  async function clear() {
    const revision = ++serial.current;
    if (key) {
      try { await saveDraft(key, null); }
      catch { if (current.current.key === key) setNotice("Não foi possível remover o rascunho salvo. Tente novamente."); return false; }
    }
    if (current.current.key === key && serial.current === revision) {
      current.current = { key, value: initial }; setSnapshot(current.current); setNotice("Rascunho removido.");
    }
    return true;
  }
  return { value: ready ? snapshot.value : initial, ready, update, clear, notice };
}
