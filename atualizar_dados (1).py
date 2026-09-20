"""
Script de atualização automática do jornal "Economia Sem Complicação"
-- VERSÃO 3: EDITORIAS SEPARADAS + HISTÓRICO PARA OS GRÁFICOS --

O QUE ESTE SCRIPT FAZ:
1. Busca Selic, IPCA e Dólar (valor atual) direto na API oficial e
   gratuita do Banco Central.
2. Busca também o HISTÓRICO recente de Selic e IPCA (últimos pontos),
   pra alimentar os gráficos do site automaticamente.
3. Pede pro Gemini (Google) BUSCAR de verdade na internet notícias
   econômicas de hoje, JÁ SEPARADAS POR EDITORIA (hoje, brasil, mundo,
   mundo_brasil, geopolitica, bolsas), usando "Grounding with Google
   Search". Isso é grátis até 5.000 buscas por mês - rodando de hora em
   hora dá uns 720/mês, dentro do limite.
4. Se a chave do Gemini não estiver configurada (ou algo falhar), cai
   pro plano B: notícias reais do RSS gratuito da Agência Brasil, sem
   IA, tudo dentro da editoria "hoje" (o RSS não tem como separar por
   editoria sozinho).
5. Salva tudo em dados.json, no formato que o index.html já sabe ler.

DEPENDÊNCIAS (todas grátis):
    pip install requests feedparser

COMO CONSEGUIR A CHAVE DO GEMINI (grátis, sem cartão):
    1. Vá em aistudio.google.com e entre com sua conta Google.
    2. Clique em "Get API Key" -> "Create API key".
    3. Copie a chave e configure como segredo GEMINI_API_KEY no GitHub
       (Settings > Secrets and variables > Actions).
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


def buscar_serie_bcb(codigo: int, quantidade: int = 1) -> list:
    url = (
        f"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}"
        f"/dados/ultimos/{quantidade}?formato=json"
    )
    resposta = requests.get(url, timeout=15)
    resposta.raise_for_status()
    return resposta.json()


def buscar_indicadores_oficiais() -> dict:
    indicadores = {}
    for nome, codigo in CODIGOS_BCB.items():
        try:
            item = buscar_serie_bcb(codigo, 1)[0]
            indicadores[nome] = {"valor": item["valor"], "data_referencia": item["data"]}
        except Exception as erro:
            print(f"[aviso] não consegui buscar {nome}: {erro}")
            indicadores[nome] = None
    return indicadores


def buscar_historico_para_graficos() -> dict:
    """Busca os últimos pontos de Selic e IPCA direto do Banco Central,
    pra alimentar os gráficos do site sem precisar de IA nem edição manual."""
    historico = {}
    try:
        # Selic muda pouco (só a cada reunião do Copom, ~45 em 45 dias);
        # pegamos os últimos 8 valores publicados pra ter uns 3-4 cortes/altas.
        pontos = buscar_serie_bcb(432, 8)
        historico["selic"] = [{"data": p["data"], "valor": p["valor"]} for p in pontos]
    except Exception as erro:
        print(f"[aviso] não consegui buscar histórico da Selic: {erro}")
        historico["selic"] = []
    try:
        # IPCA acumulado 12 meses, últimos 6 meses (1 ponto por mês).
        pontos = buscar_serie_bcb(13522, 6)
        historico["ipca"] = [{"data": p["data"], "valor": p["valor"]} for p in pontos]
    except Exception as erro:
        print(f"[aviso] não consegui buscar histórico do IPCA: {erro}")
        historico["ipca"] = []
    return historico


# ---------------------------------------------------------------------------
# PASSO 2 (PRINCIPAL): Notícias via Gemini, já separadas por editoria
# ---------------------------------------------------------------------------

GEMINI_MODELO = "gemini-2.5-flash"  # rápido e está na cota grátis
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODELO}:generateContent"
)

# As chaves aqui (hoje, brasil, mundo...) precisam bater com os ids das
# seções que o index.html sabe renderizar. Não mude os nomes das chaves
# sem também mudar o JavaScript do site.
EDITORIAS_PEDIDAS = {
    "hoje": "os 4-5 acontecimentos econômicos MAIS importantes do dia, de qualquer tema",
    "brasil": "economia doméstica do Brasil: PIB, emprego, inflação, juros, contas públicas, indústria, consumo, agronegócio",
    "mundo": "economia internacional: EUA/Fed, China, Europa, bancos centrais estrangeiros, comércio global",
    "mundo_brasil": "decisões políticas ou institucionais (Congresso, governo, decreto, lei) com efeito econômico real",
    "geopolitica": "conflitos, alianças, tarifas e acordos internacionais com efeito econômico",
    "bolsas": "Bolsa de valores: Ibovespa, ações específicas, dividendos, resultados de empresas, fluxo de investidor",
}

PROMPT_NOTICIAS = f"""
Busque na internet as notícias econômicas mais importantes e ATUAIS do
Brasil e do mundo. Organize o resultado por editoria, buscando de 2 a 4
notícias DIFERENTES ENTRE SI para cada uma destas editorias:

{json.dumps(EDITORIAS_PEDIDAS, ensure_ascii=False, indent=2)}

Para CADA notícia, também busque (usando a busca de verdade) uma
IMAGEM real relacionada ao tema, mas SOMENTE se ela vier de uma destas
fontes, que têm licença de uso livre: Wikimedia Commons
(upload.wikimedia.org), Unsplash (images.unsplash.com) ou Pexels
(images.pexels.com). A URL da imagem precisa ser um link direto pro
arquivo de imagem (terminando em .jpg, .jpeg, .png ou .webp), não o
link de uma página de busca ou de uma galeria.

Responda SOMENTE com um objeto JSON válido, sem texto antes ou depois,
sem crases, neste formato exato (as chaves de fora, tipo "hoje" e
"brasil", são fixas e têm que aparecer todas, mesmo que com lista vazia
se não achar nada relevante):

{{
  "hoje": [
    {{
      "id": "identificador curto e único em minúsculas, tipo selic-corte-16-09",
      "categoria": "JUROS & COPOM",
      "titulo": "manchete curta, factual, sem sensacionalismo",
      "subtitulo": "uma frase que traduz o que a notícia SIGNIFICA na prática, para quem não entende economia — não repita o título",
      "texto": "3 a 5 frases em texto corrido (sem tópicos nem rótulos tipo 'o que aconteceu'), contando o fato com números reais, o contexto/motivo, e só quando fizer sentido de verdade, o efeito prático pra empresas ou pessoas",
      "fonte_nome": "nome do veículo ou órgão oficial",
      "fonte_url": "link real da fonte que você usou",
      "data_publicacao": "data que a fonte original publicou, formato DD/MM/AAAA",
      "imagem_url": "link direto pra imagem real (Wikimedia Commons, Unsplash ou Pexels) relacionada ao tema, ou string vazia se não encontrar uma confiável",
      "imagem_credito": "nome da fonte da imagem (ex: 'Wikimedia Commons'), ou string vazia se imagem_url estiver vazio"
    }}
  ],
  "brasil": [ ... mesmo formato ... ],
  "mundo": [ ... mesmo formato ... ],
  "mundo_brasil": [ ... mesmo formato ... ],
  "geopolitica": [ ... mesmo formato ... ],
  "bolsas": [ ... mesmo formato ... ]
}}

Regras importantes:
- Só use fatos que você realmente encontrou na busca, com uma fonte real. Nunca invente número, declaração ou notícia.
- NUNCA invente uma URL de imagem. Se você não tiver certeza de que o link é real e de uma das três fontes permitidas, deixe "imagem_url" como string vazia — é preferível não ter imagem a ter um link quebrado.
- Não repita a mesma notícia em duas editorias diferentes, nem a mesma imagem em duas notícias diferentes.
- Não force um "efeito prático" se a notícia não tiver relação direta com o dia a dia das pessoas — nesse caso, só conte o fato e o contexto.
- Se genuinamente não encontrar nada relevante e atual pra uma editoria, devolva a lista vazia [] pra ela em vez de inventar.
- Não use linguagem sensacionalista, nem em conflitos/geopolítica: descreva o fato, sem alarmismo.
"""


def validar_imagem_url(url: str) -> bool:
    """Só aceita link direto de imagem vindo de uma das 3 fontes de
    licença livre permitidas. Qualquer outra coisa é descartada -
    preferimos notícia sem imagem a um link de fonte não confiável."""
    if not url:
        return False
    dominios_permitidos = ("upload.wikimedia.org", "images.unsplash.com", "images.pexels.com")
    extensoes_validas = (".jpg", ".jpeg", ".png", ".webp")
    return (
        url.startswith("https://")
        and any(dominio in url for dominio in dominios_permitidos)
        and url.lower().endswith(extensoes_validas)
    )


def sanitizar_editorias(editorias: dict) -> dict:
    """Passa por cada notícia e apaga imagem_url/imagem_credito que não
    passarem na validação, em vez de confiar cegamente no que o Gemini
    respondeu."""
    for lista in editorias.values():
        for noticia in lista:
            url = noticia.get("imagem_url", "")
            if not validar_imagem_url(url):
                noticia["imagem_url"] = ""
                noticia["imagem_credito"] = ""
    return editorias


def buscar_editorias_via_gemini() -> dict | None:
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
            timeout=90,
        )
        resposta.raise_for_status()
        dados_resposta = resposta.json()

        texto = dados_resposta["candidates"][0]["content"]["parts"][0]["text"]

        # A IA às vezes envolve o JSON em ```json ... ``` mesmo quando
        # pedimos pra não fazer isso - removemos essas crases se vierem.
        texto_limpo = re.sub(r"```json|```", "", texto).strip()

        inicio = texto_limpo.index("{")
        fim = texto_limpo.rindex("}") + 1
        editorias = json.loads(texto_limpo[inicio:fim])

        # Garante que todas as chaves esperadas existem, mesmo que vazias.
        for chave in EDITORIAS_PEDIDAS:
            editorias.setdefault(chave, [])
        return sanitizar_editorias(editorias)

    except Exception as erro:
        print(f"[aviso] busca via Gemini falhou ({erro}) - vou usar o plano B (RSS).")
        return None


# ---------------------------------------------------------------------------
# PASSO 2 (PLANO B): Notícias reais via RSS da Agência Brasil, sem IA
# ---------------------------------------------------------------------------

RSS_ECONOMIA = "http://agenciabrasil.ebc.com.br/rss/economia/feed.xml"


def buscar_noticias_via_rss(quantidade: int = 5) -> list:
    feed = feedparser.parse(RSS_ECONOMIA)
    noticias = []
    for item in feed.entries[:quantidade]:
        titulo = item.get("title", "")
        id_gerado = re.sub(r"[^a-z0-9]+", "-", titulo.lower()).strip("-")[:60]
        publicado = item.get("published_parsed")
        data_publicacao = (
            datetime(*publicado[:6]).strftime("%d/%m/%Y") if publicado else ""
        )
        noticias.append({
            "id": id_gerado or f"rss-{len(noticias)}",
            "categoria": "ECONOMIA",
            "titulo": titulo,
            "subtitulo": "",  # o RSS não traz uma explicação separada; o resumo já entra no texto
            "texto": item.get("summary", ""),
            "fonte_nome": "Agência Brasil",
            "fonte_url": item.get("link", ""),
            "data_publicacao": data_publicacao,
            "imagem_url": "",       # o RSS não tem como buscar imagem sozinho
            "imagem_credito": "",
        })
    return noticias


def buscar_editorias_do_dia() -> dict:
    editorias = buscar_editorias_via_gemini()
    if editorias:
        return editorias
    # Plano B: o RSS não separa por editoria, então tudo cai em "hoje".
    editorias_vazias = {chave: [] for chave in EDITORIAS_PEDIDAS}
    editorias_vazias["hoje"] = buscar_noticias_via_rss()
    return editorias_vazias


# ---------------------------------------------------------------------------
# Principal
# ---------------------------------------------------------------------------

def main():
    dados = {
        "atualizado_em_utc": datetime.now(timezone.utc).isoformat(),
        "indicadores": buscar_indicadores_oficiais(),
        "historico": buscar_historico_para_graficos(),
        "editorias": buscar_editorias_do_dia(),
    }

    with open("dados.json", "w", encoding="utf-8") as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)

    total = sum(len(v) for v in dados["editorias"].values())
    print(f"dados.json atualizado com {total} notícias em {len(dados['editorias'])} editorias.")


if __name__ == "__main__":
    main()
