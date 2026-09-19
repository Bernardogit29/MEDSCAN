# MEDSCAN

MEDSCAN é um aplicativo mobile de inteligência artificial para triagem médica e assistência preventiva. O projeto foi criado em duas partes:

- `medscan-app`: app mobile em React Native com Expo, JavaScript e navegação completa.
- `medscan-api`: backend REST em Node.js, Express, MongoDB Atlas e Mongoose.

O sistema não substitui consulta médica. As telas de resultado exibem o aviso obrigatório:

> Esta análise não substitui uma consulta médica. Em caso de urgência, procure atendimento imediatamente.

## Tecnologias

Frontend:

- React Native com Expo
- React Navigation
- Axios
- Expo Image Picker
- Expo Vector Icons
- JavaScript, sem TypeScript

Backend:

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- CORS
- Dotenv
- Multer
- Bcrypt
- JSON Web Token
- Gemini API para relatorios orientativos em texto e imagem

## Estrutura

```txt
MEDSCAN/
  medscan-app/
    App.js
    src/
      api/
      components/
      constants/
      context/
      navigation/
      screens/
      utils/
  medscan-api/
    server.js
    src/
      config/
      controllers/
      middleware/
      models/
      routes/
      services/
      utils/
    uploads/
```

## Configurar MongoDB Atlas

1. Crie um cluster no MongoDB Atlas.
2. Crie um usuário de banco com senha.
3. Libere seu IP em `Network Access`.
4. Copie a connection string do Atlas.
5. No backend, crie `medscan-api/.env` usando `medscan-api/.env.example` como base.

Exemplo:

```env
PORT=3000
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/medscan?retryWrites=true&w=majority
JWT_SECRET=um_segredo_forte
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
```

Gere a chave no Google AI Studio e configure `GEMINI_API_KEY` no arquivo local ou nas variaveis do Render. A chave é obrigatória para análises. Sem ela, o backend retorna indisponibilidade (503). O modelo configurado é respeitado; confirme sua disponibilidade no projeto do Google.

## Rodar o backend

```bash
cd medscan-api
npm install
npm run dev
```

A API roda em:

```txt
http://localhost:3000
```

Rotas principais:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/ai/analyze`
- `GET /api/history`
- `GET /api/history/:id`
- `POST /api/history`
- `GET /api/monitoring`
- `POST /api/monitoring`
- `GET /api/devices`
- `POST /api/devices`
- `GET /api/profile`
- `PUT /api/profile`

## Rodar o app Expo

Crie `medscan-app/.env` usando `medscan-app/.env.example` como base:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

Use a URL correta para seu ambiente:

- Web ou iOS Simulator: `http://localhost:3000/api`
- Android Emulator: `http://10.0.2.2:3000/api`
- Celular físico: `http://SEU_IP_NA_REDE:3000/api`

Depois rode:

```bash
cd medscan-app
npm install
npm start
```

## Fluxo implementado

- Tela Inicial
- Login
- Cadastro
- Home / Converse com IA
- Envio de exame, imagem ou sintomas
- Resultado da IA com aviso médico
- Histórico com detalhes
- Monitoramento de saúde
- Perfil e configurações
- Barra inferior nas telas principais

## Dados mockados

O endpoint de análise não retorna resultados mockados: falhas de configuração, cota ou resposta incompleta são informadas ao app. O app também possui mocks locais para histórico, monitoramento, dispositivos e resultado caso o backend esteja indisponível durante testes de interface.

## Segurança

- Senhas são salvas com `bcrypt`.
- Rotas privadas usam JWT via `authMiddleware`.
- Variáveis sensíveis ficam no `.env`.
- Chaves de API não são salvas no código.

## Observação médica

Todas as análises são orientativas. Em caso de urgência, procure atendimento médico imediatamente.

## Atualização de experiência e análise

- Início com identidade verde e branca, acesso ao prontuário e à análise em tela própria. Os indicadores da Home ficam sem valores até existir uma fonte de medições confiável; não representam monitoramento ativo.
- Formulário com sintomas, imagem, duração, intensidade e contexto opcional.
- Resultado apresenta o relatório completo salvo em `analysis.result`, sem porcentagens de confiança inventadas. O botão de complemento leva o relato e as perguntas para uma nova análise; imagens precisam ser anexadas novamente.
- Respostas estruturadas seguem o [formato JSON Schema da API Gemini](https://ai.google.dev/gemini-api/docs/structured-output). O serviço valida os campos antes de salvar. A validação estrutural não é validação clínica.
- O filtro antigo que rejeitava menções a outros sistemas do corpo foi removido.

Validação local: `node --test medscan-api/src/services/aiService.test.js`. Os testes simulam o provedor; uma avaliação clínica das respostas reais continua necessária. Para verificar o bundle web: `cd medscan-app` e `npx expo export --platform web`.

Teste de interface sem Gemini/banco: execute `node scripts/preview-api.cjs`. Em outro terminal PowerShell, dentro de `medscan-app`, execute `$env:EXPO_PUBLIC_API_URL='http://localhost:3001/api'; npx expo start --web --port 8083` e abra `/analise`. Use somente relatos fictícios. Esta configuração é restrita ao processo de teste e não altera o `.env`. Encerre ambos os processos ao terminar.

Os parâmetros clínicos de navegação permanecem em memória e não entram nas URLs. Teste: `node --test medscan-app/src/utils/navigationState.test.mjs`. O complemento mantém a pessoa do registro original; o formulário exige carregar o prontuário antes do envio.

### Registros de monitoramento no prontuário
`GET /api/monitoring/history?personId=self` retorna até 100 medições e comparações descritivas entre valores do mesmo indicador/pessoa. `POST /api/monitoring` aceita `monitoredPersonId`, `heartRate` (bpm), `glucose` (mg/dL), `measuredAt` (ISO; padrão agora) e `note`. Pelo menos um indicador deve ser informado. O formulário usa o horário do envio; os horários são exibidos no fuso local do aparelho. Não há detecção clínica de emergência ou integração com wearables nesta implementação.

Registros antigos, criados com valores de demonstração e sem `source: recorded`, não entram nos relatórios. Publique o backend atualizado antes de usar os novos endpoints no app conectado ao Render. Testes: `node --test medscan-api/src/services/monitoringEvents.test.js medscan-api/src/controllers/monitoringController.test.js`.
