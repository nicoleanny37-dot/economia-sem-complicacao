from dataclasses import dataclass

@dataclass
class DictionaryResult:
    term: str
    meaning: str
    simple_explanation: str
    example: str
    why_it_matters: str
    life_impact: str
    current_context: str
    sources: list[str]

def search_term(term: str) -> DictionaryResult | None:
    # Ligar a uma base confiável/API.
    # Termos desconhecidos não recebem definição inventada.
    if not term.strip():
        return None
    return None
