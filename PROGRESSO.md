# MEDSCAN — progresso em 18/09/2026

## Pedido
Melhorar as respostas de sintomas e modernizar o app seguindo principalmente a terceira referência verde e branca. As primeiras duas imagens servem de inspiração.

## Implementado localmente
- Home com cabeçalho verde, cartão de prontuário, grade de indicadores e acessos rápidos. Indicadores ainda sem integração real, exibidos sem valores fictícios.
- Tela Analyze própria com sintomas, imagem (sem corte forçado), duração, intensidade, contexto opcional e seleção explícita da pessoa.
- Resultado exibe analysis.result.details e todas as seções do relatório. Complemento preserva relato e pessoa e abre nova análise. Imagens precisam ser reenviadas.
- Tema, tipografia e componentes compartilhados modernizados; prontuário renomeado; navegação inferior corrigida.
- Serviço Gemini com prompt contextual, resposta JSON validada, sem fallback clínico fictício ou porcentagens inventadas. Modelo configurado respeitado. Erros de configuração, cota e indisponibilidade explícitos.
- Removido filtro por palavras que rejeitava referências pertinentes a outros sistemas do corpo.
- Parâmetros de navegação com dados de saúde são excluídos das URLs web.
- Corrigido acesso a user.name quando a sessão ainda está nula.

## Validação concluída
- 10 testes automatizados passaram: node --test medscan-api/src/services/aiService.test.js medscan-app/src/utils/navigationState.test.mjs
- Build web passou: npx expo export --platform web --output-dir dist
- git diff --check sem erros de whitespace.
- Home inspecionada em navegador e em viewport de celular (390 x 844).
- Fluxo de interface validado com API local de dados fictícios: entrada vazia, envio de sintomas/duração/intensidade, relatório detalhado, complemento com pessoa preservada e URLs sem dados clínicos.
- API fictícia reproduzível em scripts/preview-api.cjs. Não usa Gemini nem banco de dados. Processos de teste nas portas 3001/8083 encerrados.

## Bloqueio externo confirmado
Há chave Gemini no .env local; ela não foi exibida nem alterada. A configuração local continua GEMINI_MODEL=gemini-2.5-pro.
- Consulta de modelos autenticada funcionou.
- Geração com gemini-2.5-pro e gemini-2.5-flash retornou HTTP 404.
- Geração com gemini-3.6-flash e gemini-3.8-flash retornou HTTP 503.
- Testes usaram apenas relatos fictícios. Nenhuma resposta real completa foi obtida; não afirmar qualidade clínica validada.
- Próximo passo para a IA real: resolver disponibilidade/configuração do projeto Gemini e repetir teste com modelo acessível. Não trocar silenciosamente o modelo por uma opção não validada.

## Estado
Alterações salvas no workspace, sem commit, push ou deploy. Preview local principal em http://localhost:8082/inicio (processo Expo iniciado nesta sessão; reabrir se necessário).
As telas antigas de monitoramento ainda possuem dados de demonstração; não confundir com medições reais. Testes em aparelho físico e avaliação clínica das respostas não foram realizados.

## Ajuste visual solicitado após a revisão
- Home e Analyze agora compartilham BrandHero, com a mesma marca, círculos decorativos, proporções e tipografia do cabeçalho da segunda referência.
- Removido o antigo banner com maleta e tipografia pesada da análise.
- Cartão de visão geral e ícones de sinais vitais usam colors.primary (#075E52), igual ao topo.
- Ícones de envio da análise padronizados em verde escuro, com traço de contorno.
- Alterações conferidas visualmente no preview e compilação Babel dos três arquivos passou.

## Login no Expo e padronização completa
- API configurada no app: Render, HTTPS. Health check retornou 200 e database connected. Rota /api/auth/login com credenciais fictícias retornou 401 corretamente; o mesmo fluxo foi confirmado na interface web.
- Prazo de login/cadastro ampliado de 8 para 60 segundos para tolerar servidor lento. Mensagens distinguem timeout, rede, credenciais inválidas e indisponibilidade; erros agora ficam visíveis no formulário.
- Novo helper authRequest.js e quatro testes aprovados para essas condições.
- Todas as telas principais usam BrandHero; login, cadastro e boas-vindas usam AuthLayout. Monitoramento, perfil, notificações, prontuário e resultado com cabeçalho verde, mesma largura, margens e cartões. Ícones de sinais vitais em verde escuro.
- Build web passou. Login, cadastro, monitoramento e perfil inspecionados no navegador.
- Expo estava desligado e foi iniciado novamente na porta 8082 em modo LAN. No celular, recarregar o projeto. Login real com as credenciais do usuário e no aparelho físico ainda precisa ser confirmado pelo usuário; nenhum acesso a conta real foi realizado.

## Prontuário com monitoramento
- Layout simplificado inspirado na referência: seleção de pessoa, grupos com linhas expansíveis para perfil, sintomas, exames, variações e relatório de medições.
- Novo GET /api/monitoring/history?personId=... retorna até 100 medições reais e diferenças por indicador/pessoa, com valores, datas, intervalo e observação. Comparações são descritivas, sem limiares clínicos ou classificação automática de urgência.
- POST /api/monitoring valida frequência/glicose e data, vincula pessoa ao usuário e marca source=recorded. Documentos antigos sem essa origem não são usados: alguns eram criados automaticamente com números fictícios.
- Formulário manual no prontuário registra o horário do envio. Integração com dispositivos reais ainda não existe.
- Monitoramento deixa de criar medições em GET e passa a consultar registros por pessoa; leitura mais recente de cada indicador.
- Testes: 8 novos casos (comparações e controllers), todos passaram. Build web passou. Layout e abertura do formulário inspecionados; nenhum registro fictício foi gravado na conta do usuário.
- IMPORTANTE: API Render continua na versão anterior. Publicar as mudanças do backend é necessário para liberar o relatório e o formulário no Expo apontando para Render. Frontend desabilita registro quando o endpoint novo está indisponível. Nenhum deploy feito.

## 19/09/2026 — Perfil e apresentação do prontuário
- Prontuário: cartões individuais de análises com categoria, data, título limitado a duas linhas e acesso aos detalhes. Preferências de compactação, ordem e ocultação de prévias carregadas do perfil.
- Perfil: novo cabeçalho verde escuro com iniciais, edição de nome/idade, atalhos de monitoramento/família e configurações agrupadas.
- Configurações: privacidade das prévias; central de atualizações ativável; lista compacta/ordem; ajuda com perguntas expansíveis. Salvamento via PUT /profile, preservando as demais preferências lidas novamente antes de salvar.
- Familiares novos não recebem sinais vitais fictícios. Removida contagem fixa de aparelhos no perfil.
- Notificações: substituídos avisos fictícios por análises reais recentes da conta, respeitando preferência de visibilidade e ativação.
- Validação: telas compiladas com Babel; conferidos perfil, painéis de configurações, ajuda e lista real do prontuário no navegador. Não alteradas preferências ou dados pessoais da conta para testar o salvamento.

## 19/09/2026 — Preparação para testes por link no navegador
- Link público informado pelo usuário: https://medscan-h9jq.onrender.com/. Bundle público aponta para https://medscan-api-f658.onrender.com/api.
- Corrigidas validações do cadastro/login para mensagens inline web; normalização do e-mail; validação de idade, senha e duplicação no backend; removido botão Google sem integração.
- Sessões expiradas/malformadas deixam de ser restauradas no frontend (API continua responsável por verificar JWT).
- 29 testes automatizados aprovados, incluindo cadastro com hash real e login, senha incorreta, duplicação, campos inválidos e expiração da sessão.
- Smoke test público com conta identificada de QA passou (201 cadastro, 200 login/perfil, 401 senha incorreta, 409 duplicação). Script reproduzível scripts/smoke-auth.cjs; credenciais temporárias fora do repositório, nunca impressas.
- Três análises fictícias reais no backend público passaram em 14–15s; modelo gemini-3.6-flash, relatório completo. Caso urgente priorizou atendimento; relato escasso usou Indeterminado e perguntas. Não equivale a validação clínica.
- Local gemini-2.5-pro continua retornando 404; tentativa temporária com 3.5-flash retornou 503. Nenhuma configuração de modelo alterada.
- Roteiro do grupo em TESTE-DO-GRUPO.md. Há uma conta QA e três análises fictícias no banco público.
- Publicação pendente. A revisão automática bloqueou acesso a dashboard.render.com por falta de autorização explícita ao painel privado. Não contornar por CLI/git; solicitar autorização se for publicar.

## Correção da intermitência da IA — 19/09/2026
- Nova política providerRetry: até três chamadas ao provedor para HTTP 500/502/503/504, pausas de 1s e 2s e orçamento total de 120s. Cada chamada limita o timeout ao tempo restante (máximo 60s).
- Retentativas apenas dentro do serviço Gemini, antes da gravação de Analysis. Sem repetição do POST do app e sem troca de modelo.
- Erros de configuração, cota, resposta inválida e timeout ambíguo não são repetidos automaticamente.
- Interface avisa que a preparação pode levar dois minutos. Falha persistente mantém mensagem explícita; o relato permanece no formulário.
- 13 testes do serviço/retentativas aprovados, incluindo recuperação 503→sucesso e esgotamento do prazo. AnalyzeScreen compilada com Babel.
- Correção somente local, conforme restrição do usuário de não alterar o Render. Para o link público receber a correção, ainda é necessário publicar o backend e frontend. Nenhum deploy realizado.

## 20/09/2026 — Layout de PC e versões do relato
- Web a partir de 1100px: menu lateral fixo nas telas principais, conteúdo até 1200px, margens próprias e quatro indicadores por linha. Home com visão geral e ações em duas colunas. Entrada/login/cadastro em duas colunas a partir de 1000px. Celular mantém navegação inferior.
- Resultado: card de complemento com campo de texto, validação, estado de envio e preservação do texto em falhas. Nova análise recebe parentAnalysisId/caseId e additionalInfo; relato original não é sobrescrito.
- API resolve o registro pai pela conta autenticada e herda pessoa/caso do banco. Limites de texto: 4000 caracteres novos, 12000 acumulados.
- Prontuário agrupa por caseId (ou _id para antigos), mostra número de versões e abre a mais recente; resultado oferece alternância entre versões. Registros antigos sem vínculo não são mesclados por semelhança de texto.
- 41 testes automatizados passaram, incluindo vínculo entre versões, isolamento da conta e ausência de gravação quando a IA falha. Conferidos desktop, entrada mobile e card de complemento no navegador; nenhum complemento enviado na conta pessoal.
- IA: retentativas já implementadas (três chamadas/120s). Teste direto com credencial local e gemini-3.6-flash retornou 429 (cota). API pública respondeu 201 em 14,9s para caso fictício. Não é possível eliminar interrupções externas apenas com código; distinguir cota e falha transitória. Nenhuma variável do Render alterada.
- Mudanças de UI e vínculo entre relatos precisam de publicação conjunta do backend e frontend. Restrição anterior do usuário: não mexer no Render. Não houve commit, push ou deploy nesta etapa.
- Build web final aprovado com --max-workers 1; primeira tentativa encontrou erro transitório de leitura de dependência no Windows. Nenhuma dependência foi alterada.

## 22/09/2026 — Idioma web e tradução automática
- Foto do navegador mostra textos alterados (Prontuário → Pronúncia) e glifos de ícones corrompidos. Textos-fonte corretos; HTML anterior declarava lang=en. Tradução automática é a causa provável, não reproduzida no computador do professor.
- Configurado web.lang=pt-BR e template public/index.html com UTF-8, translate=no e notranslate para preservar interface e fontes de ícones. Mensagem sem JavaScript também em português.
- Títulos de todas as rotas no navegador agora em português com marca MEDSCAN, sem nomes internos como History.
- Build web aprovado; HTML exportado conferido; navegação compilada e glifos destacados validados na biblioteca. Consulta HTTP pública não disponível nesta sessão; não houve teste no navegador do professor.
- Correção local pronta. Nenhum push/deploy nem alteração do Render, respeitando restrição anterior do usuário. Publicação do frontend pendente.

## 22/09/2026 — Diagnóstico real da indisponibilidade da IA
- Teste público usando somente conta QA existente: POST /api/ai/analyze retornou HTTP 503 em 30 segundos, mensagem antiga de indisponibilidade após retentativas; nenhuma análise criada nessa tentativa.
- Chave local lista modelos, mas geração em gemini-2.5-pro e gemini-2.5-flash retornou 404. Uma chamada curta ao gemini-3.6-flash respondeu, mas análises completas em 3.6/3.8 com alternativa 3.7 terminaram em 503; primeira chamada completa 3.7 sofreu ECONNRESET. Não confundir listagem ou teste curto com validação completa.
- .env local atualizado de gemini-2.5-pro para gemini-3.6-flash; credenciais intactas e não exibidas. Nenhuma configuração do Render alterada.
- Nova recuperação: após HTTP 500/502/503/504, usar GEMINI_FALLBACK_MODEL (padrão 3.7-flash), mantendo três chamadas/120s, mesmo conteúdo/esquema e gravação apenas após resposta válida. Modelo efetivo salvo no resultado. Valor vazio desativa alternativa. Alternativa implementada, mas não validada com sucesso em geração real nesta sessão devido às falhas externas.
- Cota agora retorna 429/AI_QUOTA_EXCEEDED sem tentativa de contorno; configuração, acesso, formato, timeout e indisponibilidade têm códigos distintos no JSON. Scripts diagnose-ai.cjs e check-public-ai.cjs documentados no README.
- 18 testes automatizados aprovados (recuperação, modelo efetivo, preservação de payload, erros sem retentativa e ausência de gravação em falha). A indisponibilidade pública NÃO foi resolvida nem houve deploy.
- Pergunta enviada ao usuário: autorizar publicação da API e atualização das variáveis de modelo no Render, devido à restrição anterior. Sem resposta até aqui. Para tolerar falha geral do Gemini, será necessário validar outro provedor com credencial/cota disponível ou a opção local já discutida.

## 22/09/2026 — Grok reserva preparado sem consumo
- Usuário decidiu adicionar Grok como reserva, mas não pode gastar agora. Implementação local desativada por padrão e explicitamente com GROK_FALLBACK_ENABLED=false no .env; nenhuma chamada real a Gemini/Grok nesta etapa, nenhum crédito comprado, nenhum deploy.
- Ativação exige flag exatamente true, XAI_API_KEY e GROK_MODEL no backend. Chave sozinha nunca habilita consumo. Nome de modelo sem padrão para escolher/validar com preços e acesso disponíveis no momento da ativação.
- Com reserva ativa e formato compatível: Gemini principal → uma chamada Grok apenas em HTTP 500/502/503/504. Mantido orçamento total 120s e no máximo 60s/chamada. Sem tentativas pagas adicionais; cota, configurações inválidas, respostas incompletas ou timeout ambíguo não acionam reserva.
- Grok usa Chat Completions com JSON Schema e mesmas instruções/conteúdo; rejeita resultado truncado, recusado ou incompleto. source/model efetivos preservados no único resultado salvo. Sem alterações nos vínculos de versões do prontuário.
- Suporte preparado para texto/JPG/PNG; WebP/HEIC/HEIF continuam no Gemini sem descartar a imagem. É necessário modelo com visão/JSON Schema quando ativar para imagens.
- 26 testes automatizados aprovados, incluindo bloqueio de chamadas sem ativação, recuperação, cobrança/cota, relatório inválido e preservação das imagens. Qualidade/acesso real do Grok ainda NÃO validados. README e .env.example documentam ativação futura. Enquanto desativado, Grok não resolve a indisponibilidade pública atual.

## 22/09/2026 — Remoção do Grok por restrição de orçamento
- Usuário pediu remover Grok porque não há plano gratuito. Removidos cliente xAI, seleção da reserva, testes exclusivos, instruções de ativação e variáveis XAI_API_KEY/GROK_MODEL/GROK_FALLBACK_ENABLED do .env local e exemplo. Nenhuma credencial exibida. Registros históricos deste arquivo mantidos apenas como contexto; a integração descrita acima não existe mais no código atual.
- Mantidos Gemini, alternativa interna, validação estruturada e distinção de erros. 18 testes aprovados, nenhuma chamada de geração real nesta etapa, nenhuma alteração do Render.
- Alternativa gratuita a avaliar: Groq (empresa diferente de Grok), com Free tier limitado por modelo. Ainda não integrado nem testado com relatos.
- Render: documentação informa suspensão de web services gratuitos após 15 min ociosos. Pode explicar demora inicial/conexão, mas os testes anteriores diretamente contra Gemini fora do Render também retornaram 503. Não há evidência para atribuir a indisponibilidade apenas à hospedagem; logs do deployment seguem não inspecionados.

## 22/09/2026 — Groq integrada como reserva de texto
- Usuário autorizou adicionar Groq. Cliente Chat Completions em api.groq.com com JSON Schema estrito, mesmo prompt/relato, modelo padrão openai/gpt-oss-120b e 3072 tokens máximos de saída.
- GROQ_FALLBACK_ENABLED=true, GROQ_API_KEY vazia e GROQ_MODEL preparados no .env local e exemplo. Nenhuma credencial criada, nenhum plano alterado, nenhuma chamada real. Chave ainda precisa ser preenchida; manter conta Free conforme orçamento do usuário.
- Para texto, Gemini principal → uma tentativa Groq em HTTP 500/502/503/504. Orçamento total 120s; sem repetir Groq após falha. Cota, credenciais inválidas, resposta incompleta e timeout ambíguo não acionam reserva. Sem chave/flag, mantém Gemini.
- Imagens permanecem no Gemini porque o modelo padrão Groq é somente texto. Não há descarte de anexos. Resultado guarda source/model reais e mantém um único registro completo com vínculos existentes.
- 25 testes automatizados passaram (recuperação, parâmetros, preservação de contexto, desativação/sem chave, limites de tentativas, rejeição de resultados inválidos e preservação de imagens). Não equivale a validação real da Groq; testar após chave configurada. Nenhum deploy ou alteração no Render.

## 22/09/2026 — Reserva em caso de cota Gemini
- Nova captura mostra mensagem antiga de cota. Verificação local: GROQ_API_KEY preenchida e GROQ_FALLBACK_ENABLED=true (nenhum segredo exibido). Captura não identifica se o usuário está no Render ou servidor local antigo.
- Corrigido acionamento da reserva: para texto com Groq habilitada, HTTP 429 do Gemini agora permite uma única tentativa no provedor independente. Nunca repete 429 no mesmo provedor; se ambos atingirem cota, retorna erro. Sem chave ou com imagem, mantém comportamento exclusivo Gemini.
- Testes adicionados para recuperação Gemini429→Groq e encerramento quando ambos retornam429. Nenhuma geração real nem deploy nesta etapa. Ainda é necessário atualizar/reiniciar o backend efetivamente acessado pelo usuário.

## 22/09/2026 — Localhost corrigido e Groq validada no fluxo real
- Usuário confirmou teste no localhost. Causa encontrada: medscan-app/.env ainda apontava à API pública Render, portanto alterações/chave locais não eram usadas.
- Frontend local agora EXPO_PUBLIC_API_URL=http://localhost:3000/api. API local recarregada pelo nodemon (porta3000, banco conectado). Configurações públicas não alteradas.
- Teste real com conta QA existente e relato fictício via API local: HTTP201 em31s, source=groq, model=openai/gpt-oss-120b. Um registro fictício criado somente na conta QA. Isso valida funcionamento técnico; não é avaliação clínica nem garantia permanente de cota/disponibilidade.
- Expo estava na porta8081 e seu bundle ainda continha Render mesmo após editar.env. Reiniciado com cache limpo, variável local explícita e processo oculto PID24844. Logs temporários medscan-expo-local.log/medscan-expo-local-error.log. Bundle final conferido: EXPO_PUBLIC_API_URL=http://localhost:3000/api. App disponível em http://localhost:8081.
- scripts/check-public-ai.cjs aceita --local sem expor senha/token e informa provider/model/status. README documenta distinção frontend/backend local. Usuário deve recarregar a aba após reinício; pode precisar entrar novamente se a sessão tiver sido emitida por outro segredo JWT. Nenhum deploy no Render.
