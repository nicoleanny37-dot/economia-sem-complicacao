import re
import unicodedata

def _normalizar(texto):
    texto = unicodedata.normalize("NFKD", texto or "")
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9\s]", " ", texto.lower())

def _chave(noticia):
    palavras = [p for p in _normalizar(noticia.get("title", "")).split() if len(p) > 3]
    return " ".join(palavras[:18])

def remover_duplicadas(noticias):
    urls, titulos, resultado = set(), set(), []
    for noticia in noticias:
        url = noticia.get("source_url")
        titulo = _chave(noticia)
        if url in urls or (titulo and titulo in titulos):
            continue
        urls.add(url)
        if titulo:
            titulos.add(titulo)
        resultado.append(noticia)
    return resultado
