# Publicar no Static Site medscan-app existente

No projeto **medscan**, abra o Static Site **MEDSCAN** (frontend medscan-app). Em Settings, configure:

| Campo | Valor |
| --- | --- |
| Root Directory | `medscan-app` |
| Build Command | `npm ci && npm run build:web` |
| Publish Directory | `dist` |

Em Environment, configure somente a URL pública do backend:

```dotenv
EXPO_PUBLIC_API_URL=https://medscan-api-f658.onrender.com/api
```

As chaves das IAs, MongoDB e JWT pertencem ao Environment do **medscan-api**, no projeto **My Project**. Nunca coloque esses segredos no Static Site ou em variáveis EXPO_PUBLIC.

Em Redirects/Rewrites, adicione uma regra:

| Source | Destination | Action |
| --- | --- | --- |
| `/*` | `/index.html` | Rewrite |

A regra permite abrir ou atualizar `/login`, `/monitoramento` e outras páginas diretamente. Os arquivos existentes continuam sendo servidos normalmente pelo Render.

Em Headers, configure o tipo do manifesto de instalação:

| Request Path | Header Name | Header Value |
| --- | --- | --- |
| `/manifest.webmanifest` | `Content-Type` | `application/manifest+json` |

Após enviar o código ao GitHub e concluir o deploy, abra https://medscan-h9jq.onrender.com. Teste a página inicial, login, recarregamento de uma rota e envio de uma imagem de teste em um computador e em um celular.

O site possui manifesto e ícones para instalação pelo navegador. No Chrome/Edge, use a opção de instalar; no Safari do iPhone, Compartilhar → Adicionar à Tela de Início. Login, consultas ao banco e análises continuam exigindo internet. Nenhum dado de saúde ou resposta da API é armazenado por um service worker.

## Testar o build no notebook

Na pasta medscan-app, no PowerShell:

```powershell
$env:EXPO_PUBLIC_API_URL = 'https://medscan-api-f658.onrender.com/api'
npm run build:web
npm run preview:web
```

Essa variável vale somente no terminal atual e não altera o `.env` local. O build recusa URLs HTTP/localhost para impedir que o site público aponte para o computador de cada visitante.

O preview local serve os arquivos exportados; a regra de fallback das rotas diretas deve ser verificada no Render.

## Feira de ciências: manter a API pronta

O Static Site fica sempre disponível. A API `medscan-api` no plano gratuito do Render entra em pausa depois de 15 minutos sem requisições e pode levar cerca de um minuto para voltar. Nos dias da feira, use um monitor externo, como UptimeRobot, para fazer uma requisição a cada 10 minutos para uma rota simples de saúde da API:

```text
https://medscan-api-f658.onrender.com/health
```

Ative o monitor na véspera ou pouco antes de a feira começar e desative-o quando terminar. Manter a API acordada o mês inteiro consome quase todas as 750 horas gratuitas mensais do Render; por isso o monitor deve ficar ativo somente nos dias do evento.

Antes de criar o monitor, confirme que a rota `/health` responde `200 OK`. Não use `/robots.txt`, pois o Render trata esse caminho de forma especial quando uma instância gratuita está pausada.
