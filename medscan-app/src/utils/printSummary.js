export async function printSummary(html) {
  const popup = window.open("", "_blank");
  if (!popup) throw new Error("Permita a abertura da janela de impressão neste navegador e tente novamente.");
  popup.opener = null;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}
