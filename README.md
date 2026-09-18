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
GEMINI_MODEL=gemini-2.5-pro
```

Gere a chave no Google AI Studio e configure `GEMINI_API_KEY` no arquivo local ou nas variaveis do Render. Se a chave nao for configurada, o backend usa uma triagem local de contingencia em `src/services/aiService.js`.

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

O backend retorna análise mockada quando a API externa de IA não está configurada. O app também possui mocks locais para histórico, monitoramento, dispositivos e resultado caso o backend esteja indisponível durante testes de interface.

## Segurança

- Senhas são salvas com `bcrypt`.
- Rotas privadas usam JWT via `authMiddleware`.
- Variáveis sensíveis ficam no `.env`.
- Chaves de API não são salvas no código.

## Observação médica

Todas as análises são orientativas. Em caso de urgência, procure atendimento médico imediatamente.
