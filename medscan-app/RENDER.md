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
