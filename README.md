# Economia Sem Complicação

Backend inicial para alimentar o site com notícias e indicadores econômicos reais.

## Arquitetura

- `backend/news/`: coleta, normalização e deduplicação de notícias.
- `backend/market/`: integração de indicadores de mercado.
- `backend/dictionary/`: busca de termos do Economês.
- `backend/scheduler/`: atualização automática.
- `data/sources.json`: catálogo de fontes.
- `.env.example`: variáveis de ambiente.

## Regra de integridade

O sistema não inventa notícias, valores ou atualizações. Se uma fonte falhar ou não houver informação nova e verificável, mantém o último conteúdo confirmado.

## Como começar

1. Copie `.env.example` para `.env`.
2. Preencha somente as chaves dos serviços configurados.
3. Instale: `pip install -r requirements.txt`
4. Teste: `python -m backend.scheduler.hourly_update`
5. Em produção, conecte o repositório a uma hospedagem com scheduler/cron.

GitHub versiona e hospeda o código, mas não é sozinho o serviço que busca notícias a cada hora.
