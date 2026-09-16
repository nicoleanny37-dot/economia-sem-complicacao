import json
from pathlib import Path

SOURCES_FILE = Path(__file__).resolve().parents[2] / "data" / "sources.json"

def configured_international_sources() -> list[dict]:
    data = json.loads(SOURCES_FILE.read_text(encoding="utf-8"))
    return data["international"]

def fetch_international_news() -> list[dict]:
    # Ponto de integração para APIs/RSS reais.
    # Não retorna notícias fictícias.
    return []
