from urllib.parse import urlparse

def validar_noticia(noticia):
    problemas = []

    if not noticia.get("title"):
        problemas.append("sem título")
    if not noticia.get("source"):
        problemas.append("sem fonte")
    if not noticia.get("source_url"):
        problemas.append("sem URL")

    if noticia.get("source_url"):
        parsed = urlparse(noticia["source_url"])
        if parsed.scheme not in {"http", "https"}:
            problemas.append("URL inválida")

    return {"valida": not problemas, "problemas": problemas}
