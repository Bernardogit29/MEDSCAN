# MEDSCAN

**Saúde mais clara, cuidado mais organizado.**

Uma plataforma para registrar informações de saúde, compreender relatos e preparar conversas melhores com profissionais.

**Equipe MEDTECH** · Projeto de feira de ciências · Outubro de 2026  
Arthur Felipe · Bernardo Henrique · Guilherme Saymon · Henrique Xavier · Laura Massula · Pedro Henrique

> **Protótipo funcional.** O MEDSCAN oferece orientação inicial e organização de informações. Não fornece diagnóstico nem substitui uma avaliação médica.

## O problema é também de comunicação

Sintomas, resultados de exames, horários de medicamentos e consultas costumam ficar espalhados. Na hora de buscar atendimento, é difícil reconstruir a sequência dos fatos e explicar o que mudou. A pesquisa de apoio da equipe relaciona esse desafio ao letramento em saúde: compreender uma informação depende tanto de quem a recebe quanto de como ela é apresentada. [1]

O MEDSCAN reúne esses registros em um percurso simples. A pessoa pode relatar o que sente, ler uma orientação inicial, guardar a análise no prontuário e preparar um resumo para conversar com um profissional.

**Ideia central:** dar contexto ao que a pessoa já sabe sobre a própria saúde e ajudá-la a chegar mais preparada a uma conversa clínica.

### Como a pessoa usa

1. **Relata:** descreve sintomas ou envia uma imagem.
2. **Entende:** lê uma orientação com limites e próximos passos.
3. **Organiza:** guarda análises e registros no prontuário.
4. **Consulta:** leva um resumo à conversa com o profissional.

A interpretação definitiva de sintomas e exames pertence ao profissional de saúde.

## O que já existe no MEDSCAN

A versão atual pode ser acessada no navegador do computador ou celular. Login, consulta aos registros e análises de IA exigem conexão com a internet. O site também permite adicionar um atalho à tela inicial pelo navegador, facilitando o acesso com aparência de aplicativo.

### Acesso e página inicial

A pessoa cria uma conta com nome, e-mail e senha. Depois de entrar, encontra uma página inicial com atalhos para medicamentos, consultas, exames, prontuário e análise por IA. No computador, a navegação principal aparece em um menu lateral; no celular, em uma barra inferior.

O início apresenta uma saudação personalizada e uma frase que varia a cada entrada. Ilustrações com movimento suave, cores consistentes e opção de tema claro ou escuro ajudam a manter uma identidade visual comum entre as telas.

Os cartões de sinais vitais desta página apresentam valores demonstrativos. Eles mostram como a interface organiza os indicadores, sem representar uma medição feita naquele momento.

### Relatos de sintomas e envio de imagens

Na área de análise, a pessoa escolhe para quem deseja a orientação e descreve o que está acontecendo. Além do relato principal, pode informar:

- Há quanto tempo os sintomas começaram.
- A intensidade percebida.
- Informações adicionais, como idade, medicamentos, condições conhecidas ou fatores que melhoram e pioram o desconforto.
- Uma imagem de exame ou outro documento que ajude a contextualizar o relato.

O arquivo selecionado aparece em uma prévia e pode ser removido antes do envio. A análise de imagem depende da legibilidade do documento e da capacidade do provedor disponível; o sistema não garante a leitura correta de todo conteúdo enviado.

Para pessoas autenticadas, o formulário mantém um rascunho no dispositivo, separado por conta e pessoa acompanhada. Isso permite recuperar o preenchimento depois de uma interrupção. O rascunho também pode ser descartado quando a pessoa desejar.

### Orientação organizada por IA

A resposta é apresentada em partes para facilitar a leitura:

- **Resumo:** sintetiza o relato e a orientação inicial.
- **Achados relevantes:** destaca o que foi informado ou observado na imagem.
- **Possíveis explicações:** apresenta possibilidades com as incertezas do caso.
- **Sinais de atenção:** indica situações que merecem cuidado e avaliação.
- **Próximos passos:** organiza sugestões de como prosseguir.
- **Quando procurar atendimento:** apresenta uma orientação baseada nas informações disponíveis.
- **Perguntas para esclarecer o relato:** ajuda a completar informações que faltaram.
- **Limites da análise:** informa as restrições daquela resposta.

A prioridade exibida pelo sistema pode ser baixa, moderada, alta ou indeterminada. Trata-se de uma indicação orientativa, sem validação como classificação clínica. O app não apresenta porcentagens de certeza diagnóstica.

### Complementos e histórico de cada relato

Depois de ler uma orientação, a pessoa pode responder às perguntas da IA ou contar o que mudou. Por exemplo, pode acrescentar quando o desconforto começou, informar um sintoma associado ou esclarecer uma resposta anterior.

O complemento é associado ao relato de origem e gera uma nova orientação sem apagar a anterior. As perguntas e respostas das rodadas são preservadas como contexto, permitindo acompanhar a evolução das informações.

O histórico daquele relato permite consultar versões anteriores com suas datas. Relatos independentes continuam separados, mesmo quando descrevem queixas parecidas. No complemento de texto, imagens anteriores não são reavaliadas automaticamente.

### Prontuário e linha do tempo

O prontuário reúne os registros da pessoa selecionada e organiza o acesso por categoria. Relatos de sintomas, exames, medições e cuidados podem ser consultados por suas áreas próprias.

A linha do tempo apresenta os acontecimentos em ordem cronológica: análises, complementos, medições, medicamentos, tomadas registradas, alergias, vacinação e consultas. Os filtros ajudam a encontrar uma categoria sem misturar todos os registros na mesma tela.

Datas futuras aparecem como planejamento. Registros de cuidado podem ser editados, arquivados e restaurados; o arquivamento permite retirá-los da lista atual sem perder a referência no histórico.

### Medicamentos e rotina diária

A página de medicamentos usa um calendário horizontal. Ao escolher um dia, a pessoa vê os medicamentos programados e seus horários, com nome e dose informada. É possível avançar ou voltar entre semanas e retornar ao dia atual.

O cadastro permite registrar nome, dose conforme a prescrição, horários diários, período de uso e observações. A agenda utiliza essas informações para mostrar a rotina correspondente à data escolhida.

Para um horário do dia atual ou de uma data passada, a pessoa pode marcar a tomada como realizada. Essa confirmação fica registrada e aparece na agenda e no histórico. Horários futuros permanecem como programação.

A função organiza o esquema informado pela pessoa. Ela não escolhe medicamentos, altera doses ou substitui a prescrição. A agenda foi implementada para horários diários; outros esquemas precisam ser descritos nas observações e acompanhados conforme orientação profissional.

### Consultas e calendário mensal

A página de consultas apresenta um calendário mensal, com marcação nos dias que possuem agendamentos. Ao selecionar uma data, a pessoa vê as consultas daquele dia em ordem de horário.

Cada registro pode incluir especialidade ou profissional, data, horário, local, observações e situação da consulta. É possível navegar entre meses, abrir os detalhes e atualizar as informações.

Esse calendário reúne os compromissos cadastrados pelo usuário. O MEDSCAN não realiza o agendamento diretamente com clínicas ou profissionais.

### Registro de alergias

Na seção de alergias, a pessoa registra a substância ou medicamento envolvido, a reação relatada e observações. Também pode informar a gravidade e a data em que a alergia foi identificada, quando conhece esses dados.

O objetivo é manter essas informações disponíveis para consulta e organização do cuidado. O registro representa o que foi informado pela pessoa, sem confirmar uma alergia por avaliação automática.

### Carteira pessoal de vacinação

A página de vacinação organiza doses recebidas e datas futuras informadas. O cadastro pode incluir nome da vacina, dose, data, próxima dose, lote, local e observações.

Um painel resume as doses registradas e as próximas datas. A seção também oferece acessos a informações oficiais, como o Meu SUS Digital e o calendário nacional de vacinação.

As datas são fornecidas pelo usuário. O sistema não define um esquema vacinal nem sincroniza automaticamente com os registros oficiais; sua carteira pessoal serve como apoio à organização.

### Monitoramento

A área de monitoramento permite consultar indicadores da pessoa selecionada e acessar o registro manual de frequência cardíaca e glicose. Cada medição pode receber uma observação e fica associada a uma data e horário.

O histórico oferece gráficos, uma lista de medições e comparações descritivas entre valores do mesmo indicador e da mesma pessoa. Assim, é possível localizar quando um valor foi registrado e verificar o que mudou entre dois registros.

Uma diferença entre medições não confirma, por si só, uma alteração clínica. Também é necessário considerar como a medida foi obtida e as circunstâncias daquele momento.

Quando não há dados reais disponíveis, alguns cartões usam valores identificados como demonstração. A presença de cartões de dispositivos na interface não significa que exista comunicação com aparelhos físicos: a integração com sensores ainda não foi implementada.

### Notificações

A central reúne até 20 análises recentes do titular da conta. Os itens são agrupados por data e podem ser filtrados para consultar todas as atualizações ou as da última semana. Ao tocar em um item, a pessoa abre o resultado correspondente.

Nas configurações, é possível desativar essas atualizações e ocultar as prévias com títulos de saúde. A função atual é uma central dentro do app; ela não envia notificações push nem alertas automáticos de emergência para familiares.

### Resumo para consulta

Um relato salvo pode ser organizado em um documento para imprimir ou guardar em PDF. O resumo separa três tipos de informação:

1. **Informações relatadas pela pessoa:** texto original e complementos, com as respectivas datas.
2. **Medições registradas:** valores disponíveis daquela pessoa, separados dos dados de demonstração.
3. **Interpretações da IA:** orientações de cada versão, claramente identificadas como conteúdo automático.

Essa separação ajuda quem lê a distinguir o que foi relatado, o que foi medido e o que foi sugerido pela IA. O documento inclui identificação da pessoa e data de geração. Antes de compartilhar, o usuário deve revisar o conteúdo e considerar que ele contém informações pessoais de saúde.

### Perfil e acompanhamento de familiares

O perfil permite editar nome e idade e cadastrar familiares ou outras pessoas acompanhadas. Depois, é possível selecionar a pessoa correspondente ao criar uma análise ou consultar os registros de cuidado e monitoramento.

Os registros ficam vinculados à pessoa selecionada, evitando misturar informações do titular e dos familiares. Essa organização ocorre dentro da conta que faz o acompanhamento; não representa um compartilhamento automático com contas de familiares, médicos ou cuidadores.

O perfil também reúne opções de privacidade, notificações, tema claro ou escuro e apresentação do prontuário. A pessoa pode ocultar títulos de saúde nas listas, usar cartões mais compactos e alterar a ordem das análises.

### Um exemplo de uso completo

Uma pessoa descreve um desconforto que começou no dia anterior e informa a duração e intensidade. Depois de ler a orientação, responde às perguntas que ficaram em aberto. As duas versões permanecem juntas no prontuário.

Se ela já possui consultas, medicamentos ou medições cadastrados, pode consultar essas informações nas respectivas seções. Ao preparar uma consulta, gera o resumo do relato e revisa o documento antes de levá-lo ao profissional. O MEDSCAN organiza esse percurso; a decisão clínica continua dependendo da avaliação profissional.

> **Orientação, não diagnóstico.** As respostas precisam ser lidas com senso crítico e não substituem exame, avaliação ou conduta de um profissional.

## Como foi construído

O projeto combina uma interface web responsiva, uma API própria e serviços externos de IA. O fluxo é: **pessoa → API → provedor de IA → orientação estruturada**.

- **Interface:** React Native com Expo para web e mobile.
- **API:** Node.js e Express.
- **Persistência:** MongoDB.
- **Hospedagem:** site e API no Render.

Gemini é o provedor principal. Havendo chaves e reservas habilitadas, o serviço pode recorrer a Groq, Mistral, OpenRouter ou Cohere conforme o tipo de entrada. Erros temporários e de limite de uso acionam recuperação automática dentro de um tempo máximo. Uma resposta incompleta não é salva.

### Dados e responsabilidade

As senhas são protegidas por hash, as rotas privadas exigem autenticação e as chaves dos provedores de IA ficam no servidor. Os dados enviados para análise seguem para o provedor externo escolhido. Por envolver informações de saúde, o uso da plataforma exige atenção à privacidade e às regras aplicáveis, incluindo a LGPD. [3]

### Limites atuais

- Os números e gráficos da tela inicial são **demonstrativos**.
- O protótipo **não lê automaticamente** glicose, pressão arterial ou pulso por sensores.
- A prioridade exibida pela IA é **orientativa**, não uma classificação clínica validada.
- A qualidade clínica das respostas ainda precisa ser avaliada com profissionais de saúde. Modelos de IA podem produzir informações incorretas, tendenciosas ou incompletas. [2]

## Como apresentar o projeto

Uma demonstração curta deixa claro o valor da plataforma sem atribuir ao protótipo capacidades que ele ainda não tem.

1. **Comece pela situação real.** Mostre como um relato e os registros de saúde ficam difíceis de recuperar quando estão espalhados.
2. **Faça uma análise fictícia.** Envie um exemplo sem dados pessoais; apresente o resumo, as perguntas e o aviso de que a orientação não é diagnóstico.
3. **Mostre a continuidade.** Abra o prontuário, a agenda de cuidados, o monitoramento manual e o resumo para consulta.

## Próximos passos

Testar compreensão e usabilidade com pessoas reais; revisar respostas com profissionais de saúde; aprofundar proteção de dados; e, em etapa futura, estudar a integração de um sensor de frequência cardíaca. A glicose e a pressão dependeriam de instrumentos próprios de medição.

## Fontes e materiais consultados

1. Pesquisa de apoio da equipe: *Pesquisas Essenciais Para o Nosso Projeto* (material interno fornecido para esta versão).
2. Organização Mundial da Saúde, 2024. [*Ethics and governance of AI for health: guidance on large multi-modal models*](https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models).
3. Brasil. [Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

**Projeto:** [medscan-h9jq.onrender.com](https://medscan-h9jq.onrender.com)
