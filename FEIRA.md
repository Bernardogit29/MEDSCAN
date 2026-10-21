# Preparação para a feira de ciências

## Manter a API disponível durante a feira

Ideia anotada em 04/10/2026 a pedido do Bernardo. Retomar quando ele avisar que vai preparar os dias da feira. Nenhum monitor foi ativado.

O frontend é o Static Site MEDSCAN, no projeto medscan do Render:
https://medscan-h9jq.onrender.com

O backend é medscan-api, no projeto My Project:
https://medscan-api-f658.onrender.com

Plano a avaliar: usar um monitor externo (por exemplo, UptimeRobot) para enviar uma requisição GET a um endpoint leve da API a cada 5–10 minutos, durante a véspera e os três dias da feira. Verificar primeiro se existe uma rota de saúde; criar /health se necessário. Essa rota não deve chamar IAs, consumir créditos ou acessar dados pessoais.

Antes de configurar, conferir novamente as regras do Render e os intervalos disponíveis no plano gratuito do monitor. Atualmente, a API gratuita dorme após 15 minutos sem tráfego e o workspace tem 750 horas gratuitas por mês, compartilhadas entre os serviços gratuitos. O monitor pode reduzir a suspensão por inatividade, mas não garante disponibilidade nem impede reinícios ou suspensão por limites de uso.

Confirmar as datas e horários da feira com Bernardo, verificar as horas disponíveis no Render e testar o acesso pelo notebook e pelo celular antes do evento. Desativar o monitor ao terminar a feira.

Referência: https://render.com/docs/free
