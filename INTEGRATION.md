# Integração

## Site

`script.js` lê `dados/noticias.json` e `dados/indicadores.json`. O site pode continuar estático.

## GitHub Actions

O workflow em `.github/workflows/atualizar.yml` roda periodicamente e grava os JSONs no repositório.

## Secrets

Configure `OPENAI_API_KEY` em Settings → Secrets and variables → Actions.

Opcionalmente, crie a variável `OPENAI_MODEL`.

## Imagens

Use imagens próprias ou de fontes/provedores que autorizem o uso. O módulo `imagens.py` não baixa imagens aleatórias.

## Importante

O agendamento do GitHub Actions pode sofrer atraso. O horário é uma programação, não uma garantia de execução exatamente no minuto.
