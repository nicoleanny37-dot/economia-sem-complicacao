"""
Script de atualização automática do jornal "Economia Sem Complicação"
-- VERSÃO COM BUSCA DE VERDADE, USANDO A COTA GRÁTIS DO GEMINI --

O QUE ESTE SCRIPT FAZ:
1. Busca Selic, IPCA e Dólar direto na API oficial e gratuita do Banco Central.
2. Pede pro Gemini (Google) BUSCAR de verdade na internet as notícias
   econômicas de hoje, usando o recurso "Grounding with Google Search".
   Isso é grátis até 5.000 buscas por mês - rodando de hora em hora dá
   uns 720/mês, bem dentro do limite.
3. Se a chave do Gemini não estiver configurada (ou algo falhar), o
   script cai automaticamente para o plano B: pegar notícias reais do
   RSS gratuito da Agência Brasil, sem IA nenhuma.
4. Salva tudo em um arquivo dados.json.

DEPENDÊNCIAS (todas grátis):
    pip install requests feedparser

COMO CONSEGUIR A CHAVE DO GEMINI (grátis, sem cartão):
    1. Vá em aistudio.google.com e entre com sua conta Google.
    2. Clique em "Get API Key" -> "Create API key".
    3. Copie a chave e configure como segredo GEMINI_API_KEY no GitHub
       (Settings > Secrets and variables > Actions).

IMPORTANTE: ter uma assinatura do Gemini Pro/Ultra (o app de chat) NÃO
dá cota extra pra isso - o que importa é só ter uma chave de API, que
qualquer conta Google cria de graça.
"""

import json
import os
import re
from datetime import datetime, timezone

import feedparser
import requests

# ---------------------------------------------------------------------------
# PASSO 1: Números oficiais do Banco Central (SGS) - grátis, sem cadastro
# ---------------------------------------------------------------------------

CODIGOS_BCB = {
    "dolar": 1,        # Dólar americano (venda) - PTAX diário
    "selic": 432,      # Meta Selic definida pelo Copom
    "ipca_12m": 13522,  # IPCA - variação acumulada em 12 meses
}


def buscar_serie_bcb(codigo: int) -> dict:
    url = (
        f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}"
        "/dados/ultimos/1?formato=json"
    )
    resposta = requests.get(url, timeout=15)
    resposta.raise_for_status()
    return resposta.json()[0]


def buscar_indicadores_oficiais() -> dict:
    indicadores = {}
    for nome, codigo in CODIGOS_BCB.items():
        try:
            item = buscar_serie_bcb(codigo)
            indicadores[nome] = {"valor": item["valor"], "data_referencia": item["data"]}
        except Exception as erro:
            print(f"[aviso] não consegui buscar {nome}: {erro}")
            indicadores[nome] = None
    return indicadores


# ---------------------------------------------------------------------------
# PASSO 2 (PRINCIPAL): Notícias via Gemini com busca real no Google
# ---------------------------------------------------------------------------

GEMINI_MODELO = "gemini-2.5-flash"  # rápido e está na cota grátis
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODELO}:generateContent"
)

PROMPT_NOTICIAS = """
Busque na internet as notícias econômicas mais importantes do Brasil e
do mundo de HOJE. Preciso de no máximo 4 notícias, cobrindo temas
diferentes (ex: juros/Copom, câmbio, inflação, bolsa de valores ou
comércio exterior).

Responda SOMENTE com um array JSON válido, sem nenhum texto antes ou
depois, sem crases, neste formato exato:

[
  {
    "categoria": "JUROS & COPOM",
    "titulo": "manchete curta",
    "resumo": "duas frases explicando o que aconteceu, com números reais que você encontrou",
    "como_afeta_voce": "uma frase prática, em português simples, para quem está aprendendo economia",
    "fonte_nome": "nome do veículo ou órgão oficial",
    "fonte_url": "link real da fonte que você usou"
  }
]

Regra mais importante: só use fatos que você realmente encontrou na
busca, com uma fonte real. Nunca invente número ou notícia.
"""


def buscar_noticias_via_gemini() -> list | None:
    chave_api = os.environ.get("GEMINI_API_KEY")
    if not chave_api:
        print("[aviso] GEMINI_API_KEY não configurada - vou usar o plano B (RSS).")
        return None

    corpo_requisicao = {
        "contents": [{"parts": [{"text": PROMPT_NOTICIAS}]}],
        "tools": [{"google_search": {}}],  # é isso que liga a busca de verdade
    }

    try:
        resposta = requests.post(
            f"{GEMINI_URL}?key={chave_api}",
            json=corpo_requisicao,
            timeout=60,
        )
        resposta.raise_for_status()
        dados_resposta = resposta.json()

        texto = dados_resposta["candidates"][0]["content"]["parts"][0]["text"]

        # A IA às vezes envolve o JSON em ```json ... ``` mesmo quando
        # pedimos pra não fazer isso - removemos essas crases se vierem.
        texto_limpo = re.sub(r"```json|```", "", texto).strip()

        inicio = texto_limpo.index("[")
        fim = texto_limpo.rindex("]") + 1
        return json.loads(texto_limpo[inicio:fim])

    except Exception as erro:
        print(f"[aviso] busca via Gemini falhou ({erro}) - vou usar o plano B (RSS).")
        return None


# ---------------------------------------------------------------------------
# PASSO 2 (PLANO B): Notícias reais via RSS da Agência Brasil, sem IA
# ---------------------------------------------------------------------------

RSS_ECONOMIA = "http://agenciabrasil.ebc.com.br/rss/economia/feed.xml"

REGRAS_COMO_AFETA_VOCE = [
    (("selic", "copom", "juros"),
     "Mudança nos juros mexe direto no financiamento, no cartão e em quanto rende sua poupança ou CDB."),
    (("ipca", "inflação", "inflacao", "preço", "preco", "alimento"),
     "Inflação em alta corrói o poder de compra do seu salário no dia a dia."),
    (("dólar", "dolar", "câmbio", "cambio"),
     "Câmbio mexe direto no preço de viagem, produto importado e eletrônico."),
    (("bolsa", "ibovespa", "ação", "acao", "b3"),
     "Bolsa em movimento afeta quem investe direto em ações ou indiretamente via previdência e FGTS."),
    (("exportação", "exportacao", "importação", "importacao", "comércio exterior", "comercio exterior"),
     "Comércio exterior mexe com emprego em setores exportadores e com o câmbio."),
]

EXPLICACAO_PADRAO = "Mudanças na economia costumam chegar, com o tempo, no seu custo de vida - vale acompanhar."


def gerar_como_afeta_voce(titulo: str) -> str:
    titulo_lower = titulo.lower()
    for palavras_chave, explicacao in REGRAS_COMO_AFETA_VOCE:
        if any(palavra in titulo_lower for palavra in palavras_chave):
            return explicacao
    return EXPLICACAO_PADRAO


def buscar_noticias_via_rss(quantidade: int = 4) -> list:
    feed = feedparser.parse(RSS_ECONOMIA)
    noticias = []
    for item in feed.entries[:quantidade]:
        noticias.append({
            "categoria": "ECONOMIA",
            "titulo": item.get("title", ""),
            "resumo": item.get("summary", ""),
            "como_afeta_voce": gerar_como_afeta_voce(item.get("title", "")),
            "fonte_nome": "Agência Brasil",
            "fonte_url": item.get("link", ""),
        })
    return noticias


def buscar_noticias_do_dia() -> list:
    noticias = buscar_noticias_via_gemini()
    if noticias:
        return noticias
    return buscar_noticias_via_rss()


# ---------------------------------------------------------------------------
# Principal
# ---------------------------------------------------------------------------

def main():
    dados = {
        "atualizado_em_utc": datetime.now(timezone.utc).isoformat(),
        "indicadores": buscar_indicadores_oficiais(),
        "noticias": buscar_noticias_do_dia(),
    }

    with open("dados.json", "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)

    print(f"dados.json atualizado com {len(dados['noticias'])} notícias.")


if __name__ == "__main__":
    main()
