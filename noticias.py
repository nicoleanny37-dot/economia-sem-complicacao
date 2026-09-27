import os
from datetime import datetime, timezone
import feedparser
from fontes import FONTES_RSS

def _texto(entry, campo, default=""):
    valor = entry.get(campo, default)
    return valor.strip() if isinstance(valor, str) else default

def coletar_de_rss(fonte):
    feed = feedparser.parse(fonte["url"])
    limite = int(os.getenv("NEWS_MAX_PER_SOURCE", "8"))
    resultados = []

    for entry in feed.entries[:limite]:
        url = _texto(entry, "link")
        titulo = _texto(entry, "title")
        resumo = _texto(entry, "summary")
        if not titulo or not url:
            continue

        resultados.append({
            "id": url,
            "title": titulo,
            "summary_raw": resumo,
            "source": fonte["nome"],
            "source_url": url,
            "category": fonte["categoria"],
            "published_at": _texto(
                entry, "published",
                datetime.now(timezone.utc).isoformat()
            ),
        })
    return resultados

def coletar_noticias():
    todas = []
    for fonte in FONTES_RSS:
        try:
            todas.extend(coletar_de_rss(fonte))
        except Exception as exc:
            print(f"[AVISO] Falha na fonte {fonte['nome']}: {exc}")

    return todas[:int(os.getenv("NEWS_MAX_TOTAL", "40"))]
