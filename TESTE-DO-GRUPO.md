# Teste do MEDSCAN com o grupo

Endereço: https://medscan-h9jq.onrender.com/

Use inicialmente relatos fictícios. Não envie documentos de outras pessoas.

1. Crie uma conta com seu e-mail e senha de teste. Confira se aparece a tela inicial.
2. Saia pelo perfil e entre novamente. Experimente uma senha incorreta: deve aparecer uma mensagem, sem entrar.
3. Atualize a página após entrar: a sessão válida deve continuar.
4. Envie um relato fictício com sintomas, duração e intensidade. Confira se a resposta considera as informações enviadas, explica os limites e apresenta próximos passos.
5. Abra o prontuário e confirme que a análise aparece e abre o relatório completo.
6. No perfil, teste lista compacta e ordenação. Salve, mude de página e confirme o resultado.
7. Ative ocultar prévias: o título da análise deve ficar oculto nas listas, mas o relatório deve abrir ao tocar.
8. Desative atualizações na central, salve e abra Notificações. Reative depois se desejar.

Para relatar um problema, envie: navegador e aparelho, página, passos, resultado esperado, resultado que ocorreu e horário. Se enviar captura, esconda e-mail e dados pessoais. Nunca compartilhe sua senha.

## Verificação técnica em 19/09/2026
- Link público e API correspondente conferidos.
- API pública: cadastro 201, login 200, senha incorreta 401, e-mail duplicado 409 e perfil 200 com conta identificada de teste.
- Três análises fictícias na API pública: respostas completas em aproximadamente 14–15 segundos, com gemini-3.6-flash. Foram testados relato leve, urgente e pouco detalhado. Isso é teste funcional, não certificação clínica.
- 29 testes automatizados locais aprovados.
- Correções de validação de cadastro/login, sessão expirada e perfil ainda precisam ser publicadas. O site público consultado ainda tinha o botão de Google sem integração.
- A configuração Gemini local difere da publicada: gemini-2.5-pro local retorna 404. Nenhuma variável do Render foi modificada.
- Uma conta de teste e três análises fictícias foram criadas na API pública. Nenhum dado da conta pessoal do proprietário foi alterado.
