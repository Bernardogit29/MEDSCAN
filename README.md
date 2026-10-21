# MEDSCAN

> **Saúde mais clara, cuidado mais organizado.**

O MEDSCAN é uma plataforma web responsiva para organizar informações de saúde, registrar cuidados do dia a dia e oferecer orientações iniciais por inteligência artificial. O projeto foi desenvolvido para a Mostra de Tecnologia de 2026.

**Acesse a demonstração:** [medscan-h9jq.onrender.com](https://medscan-h9jq.onrender.com)

> ⚠️ O MEDSCAN não realiza diagnóstico e não substitui consulta, exame ou conduta de profissionais de saúde. As orientações por IA são informativas e indicam quando procurar atendimento.

## 📌 Informações Gerais

| Informação | Detalhes |
| --- | --- |
| **Nome do projeto** | MEDSCAN |
| **Equipe** | MEDTECH |
| **Curso** | Técnico em Informática |
| **Instituição** | FUNEC Riacho |
| **Ano/Semestre** | 2026 |
| **Professor orientador** | Rangel |
| **Setor de aplicação** | Saúde, prevenção e organização do cuidado pessoal |

## 🎯 Objetivo do Projeto

Desenvolver uma plataforma acessível pelo celular e computador que ajude pessoas a registrar sintomas, exames, medicamentos, consultas, vacinas, alergias e medições de saúde em um só lugar. O sistema organiza esses dados para facilitar o acompanhamento pessoal e a preparação para conversas com profissionais de saúde.

## 👥 Público-Alvo

- Pessoas que desejam manter seu histórico de saúde organizado.
- Familiares e cuidadores que acompanham mais de uma pessoa.
- Usuários que precisam reunir sintomas, medicamentos, consultas e documentos antes de procurar atendimento.
- Estudantes e visitantes interessados em conhecer uma aplicação responsável de IA no contexto da saúde.

## 🧩 Problema a Ser Resolvido

Informações como sintomas, resultados de exames, horários de medicamentos, vacinas e consultas costumam ficar espalhadas entre papéis, mensagens e aplicativos diferentes. Na hora de buscar atendimento, pode ser difícil lembrar a ordem dos acontecimentos, explicar o que mudou ou encontrar um documento importante.

Além disso, muitas pessoas têm dúvidas ao ler termos de saúde e não sabem quais informações são importantes para relatar ao profissional. O MEDSCAN foi pensado para organizar esse percurso, sem substituir a avaliação clínica.

## 💡 Solução Proposta

O MEDSCAN reúne registros pessoais de saúde em uma interface simples e adaptada para celular e computador. A pessoa pode relatar o que sente, receber uma orientação inicial estruturada por IA, guardar esse conteúdo no prontuário, acompanhar a rotina de cuidados e gerar um resumo para levar à consulta.

A ideia central é apoiar quatro etapas: **relatar, entender, organizar e consultar**.

```text
Pessoa registra informações
           ↓
MEDSCAN organiza o histórico e a rotina
           ↓
IA apresenta uma orientação inicial com limites claros
           ↓
Usuário revisa as informações antes de falar com um profissional
```

## 🌿 Funcionalidades do Sistema

- Cadastro, login e manutenção de sessão do usuário.
- Perfil pessoal e cadastro de familiares ou pessoas acompanhadas.
- Relato de sintomas com duração, intensidade e contexto adicional.
- Envio de imagem de exame ou documento para análise orientativa por IA.
- Resultado estruturado com resumo, achados relevantes, sinais de atenção, próximos passos e limites da análise.
- Complementos de um relato, preservando o histórico das respostas anteriores.
- Prontuário digital com linha do tempo, filtros e busca por registros.
- Calendário horizontal de medicamentos, com horários e confirmação de tomada.
- Calendário mensal de consultas, com perguntas, documentos e orientações para o encontro.
- Registro de alergias e carteira pessoal de vacinação.
- Registro manual de frequência cardíaca e glicose, com histórico e gráficos.
- Central de notificações de análises recentes dentro do sistema.
- Geração de resumo para consulta, com opção de salvar ou imprimir em PDF.
- Tema claro e escuro, layout responsivo e navegação adaptada para celular e computador.

## ✅ Requisitos Funcionais

- **RF01:** permitir cadastro, login e edição de perfil do usuário.
- **RF02:** permitir selecionar e cadastrar pessoas acompanhadas na mesma conta.
- **RF03:** permitir registrar e consultar informações de saúde, como sintomas, medicamentos, consultas, alergias, vacinas e medições.
- **RF04:** permitir enviar relatos em texto e imagens para receber orientação inicial por IA.
- **RF05:** salvar as análises e complementos no prontuário, organizados em uma linha do tempo.
- **RF06:** permitir buscar e filtrar registros no prontuário.
- **RF07:** permitir organizar medicamentos por dia e horário, registrando tomadas realizadas.
- **RF08:** permitir organizar consultas em calendário e registrar preparação para o atendimento.
- **RF09:** gerar um resumo de informações para consulta.

## 🛡️ Requisitos Não Funcionais

- O sistema deve funcionar em navegadores de computadores e celulares conectados à internet.
- A interface deve ser responsiva, legível e simples de utilizar.
- Áreas privadas devem exigir autenticação.
- Senhas devem ser armazenadas de forma protegida.
- Chaves de serviços externos devem ficar apenas no servidor, fora do código público.
- O sistema deve deixar claro que a IA oferece orientação, e não diagnóstico médico.
- Dados usados em demonstrações devem ser fictícios ou autorizados pelo usuário.

## 🛠️ Tecnologias Utilizadas

- **Linguagens:** JavaScript, HTML e CSS gerados pela plataforma web.
- **Interface:** React Native, Expo e React Native Web.
- **Back-end:** Node.js e Express.
- **Banco de dados:** MongoDB Atlas e Mongoose.
- **Autenticação:** JSON Web Token (JWT) e bcryptjs.
- **Recursos adicionais:** integração com provedores de IA, upload de imagens, geração de PDF e gráficos.
- **Hospedagem:** Render.
- **Versionamento:** Git e GitHub.

## 📁 Estrutura do Projeto

```text
MEDSCAN/
├── medscan-app/          # Interface web responsiva construída com Expo
│   ├── src/
│   ├── assets/
│   └── package.json
├── medscan-api/          # API, autenticação, banco de dados e integração com IA
│   ├── src/
│   ├── scripts/
│   └── package.json
├── output/               # Materiais e documentação do projeto
├── README.md             # Apresentação técnica para a Mostra
└── FEIRA.md              # Preparação da demonstração
```

## 🖥️ Protótipos e Telas

O protótipo funcional pode ser explorado no link abaixo, em computador ou celular:

- [Abrir MEDSCAN](https://medscan-h9jq.onrender.com)

Principais telas: boas-vindas e login, início, análise por IA, prontuário, medicamentos, consultas, vacinação, alergias, monitoramento, notificações e perfil.

## 🔐 Controle de Acesso

| Perfil | Permissões |
| --- | --- |
| **Usuário autenticado** | Gerencia seu perfil, pessoas acompanhadas e os registros vinculados à própria conta. |
| **Visitante** | Pode acessar somente telas públicas de apresentação e criar uma conta. |

O protótipo não possui um painel administrativo clínico. O acompanhamento de familiares ocorre dentro da conta responsável e não representa compartilhamento automático com médicos ou outras contas.

## 📅 Cronograma do Projeto

| Etapa | Descrição | Responsável | Situação |
| --- | --- | --- | --- |
| 1 | Levantamento do problema e pesquisa sobre saúde e IA | Equipe MEDTECH | Concluída |
| 2 | Modelagem das funções e do fluxo de navegação | Equipe MEDTECH | Concluída |
| 3 | Desenvolvimento da interface, API e banco de dados | Equipe MEDTECH | Concluída |
| 4 | Testes de navegação, responsividade e integração | Equipe MEDTECH | Em andamento |
| 5 | Preparação da demonstração para a Mostra de Tecnologia | Equipe MEDTECH | Em andamento |

## 👨‍💻 Integrantes da Equipe

| Nome | Função | Responsabilidade |
| --- | --- | --- |
| Arthur Felipe | Equipe MEDTECH | Pesquisa, testes e apresentação do projeto. |
| Bernardo Henrique | Equipe MEDTECH | Desenvolvimento, integração e apresentação do projeto. |
| Guilherme Saymon | Equipe MEDTECH | Pesquisa, testes e apresentação do projeto. |
| Henrique Xavier | Equipe MEDTECH | Pesquisa, testes e apresentação do projeto. |
| Laura Massula | Equipe MEDTECH | Pesquisa e apresentação do projeto. |
| Pedro Henrique | Equipe MEDTECH | Desenvolvimento e documentação do projeto. |

> As responsabilidades são colaborativas e podem ser atualizadas pela equipe antes da entrega final.

## ▶️ Como Executar o Projeto Localmente

O sistema possui duas partes: a interface e a API.

### 1. Preparar a API

```bash
cd medscan-api
npm install
```

Crie um arquivo `.env` com base em `.env.example` e configure as variáveis necessárias, como conexão com MongoDB, JWT e chaves de IA. **Nunca publique esse arquivo.**

```bash
npm run dev
```

Por padrão, a API fica disponível em `http://localhost:3000`.

### 2. Preparar a interface

```bash
cd medscan-app
npm install
```

Crie o arquivo `medscan-app/.env` com base em `.env.example`, apontando a interface para a API local:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Depois, execute:

```bash
npm run web
```

Para usar o MEDSCAN sem instalar nada, acesse a versão publicada no Render: [medscan-h9jq.onrender.com](https://medscan-h9jq.onrender.com).

## ⚠️ Limites e Cuidados

- O MEDSCAN é um protótipo educacional e não substitui profissionais de saúde.
- As respostas da IA podem estar incompletas ou incorretas e devem ser avaliadas com senso crítico.
- Os cartões de sinais vitais exibidos na página inicial usam valores demonstrativos quando não há registros reais.
- O sistema ainda não realiza medição automática por sensores ou dispositivos vestíveis.
- Glicose e pressão arterial exigem instrumentos próprios de medição; não podem ser obtidas apenas pela interface ou por um sensor de frequência cardíaca.
- Para a demonstração, devem ser utilizados dados fictícios e sem informações pessoais de visitantes.

## 🚀 Próximos Passos

- Realizar testes de usabilidade com usuários.
- Revisar a clareza das orientações com profissionais da área da saúde.
- Ampliar recursos de privacidade e proteção de dados.
- Estudar a integração futura de um sensor de frequência cardíaca para fins demonstrativos.

## 📚 Referências

- Organização Mundial da Saúde. [Ethics and governance of AI for health](https://www.who.int/publications/i/item/9789240084759).
- Brasil. [Lei Geral de Proteção de Dados Pessoais — LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm).

---

Desenvolvido pela **Equipe MEDTECH** para a Mostra de Tecnologia de 2026.
