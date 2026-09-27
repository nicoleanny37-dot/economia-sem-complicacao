# Economia Sem Complicação

Estrutura inicial de um jornal econômico automatizado.

## Fluxo

Fontes → coleta → deduplicação → validação → processamento → imagem/crédito → JSON → site

## Execução local

```bash
python -m pip install -r requirements.txt
python atualizar_dados.py
```

Sem chave de IA, o projeto funciona em modo seguro: coleta e estrutura as notícias sem inventar texto.

Para usar IA, configure `OPENAI_API_KEY` e, opcionalmente, `OPENAI_MODEL`.

## Automação

O arquivo `.github/workflows/atualizar.yml` executa o pipeline periodicamente pelo GitHub Actions.

## Princípio editorial

O bot não deve inventar fatos, números, fontes, declarações ou impactos. Informação sem confirmação fica marcada para revisão.
