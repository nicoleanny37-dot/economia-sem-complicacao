from datetime import datetime
from pydantic import BaseModel

class Indicator(BaseModel):
    name: str
    value: float
    unit: str
    variation: float | None = None
    timestamp: datetime
    source: str
    source_url: str

def fetch_real_market_data() -> list[Indicator]:
    # Conecte aqui uma API/endpoint oficial ou provedor confiável.
    # Sem fonte configurada, retorna vazio em vez de inventar valores.
    return []
