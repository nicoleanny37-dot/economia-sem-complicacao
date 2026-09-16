# Integração com o site existente

Conectar o frontend atual a uma camada de dados real sem recriar a interface.

## Endpoints sugeridos

GET /api/news
GET /api/news/:id
GET /api/indicators
GET /api/dictionary/search?q=selic
POST /api/subscribers
POST /api/cron/news

## Ciclo

1. Buscar fontes nacionais e internacionais.
2. Buscar indicadores.
3. Validar datas, URLs e fontes.
4. Consolidar duplicatas.
5. Atualizar eventos existentes quando houver mudança real.
6. Criar eventos novos relevantes.
7. Reavaliar destaques.
8. Atualizar textos, valores e gráficos em conjunto.
9. Manter último conteúdo confirmado em caso de falha.

Armazene timestamps em UTC e apresente ao usuário em America/Sao_Paulo.
