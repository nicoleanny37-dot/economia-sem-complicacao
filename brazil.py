import json
from pathlib import Path

SOURCES_FILE = Path(__file__).resolve().parents[2] / "data" / "sources.json"

def configured_brazil_sources() -> list[dict]:
    data = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    return data["brazil"]

def fetch_brazil_news() -> list[dict]:
    # Ponto de integração para APIs/RSS reais.
    # Não retorna notícias fictícias.
    return []
