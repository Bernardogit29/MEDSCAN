export function validateRegistration({ name, age, email, password, confirmPassword }) {
  if (!name.trim() || !String(age).trim() || !email.trim() || !password || !confirmPassword) return "Preencha todos os campos para criar sua conta.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Informe um e-mail válido.";
  if (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120) return "Informe uma idade entre 0 e 120 anos.";
  if (password.length < 8) return "Use uma senha com pelo menos 8 caracteres.";
  if (new TextEncoder().encode(password).length > 72) return "Use uma senha de até 72 bytes (acentos e emojis ocupam mais espaço).";
  if (password !== confirmPassword) return "A confirmação precisa ser igual à senha.";
  return "";
}
