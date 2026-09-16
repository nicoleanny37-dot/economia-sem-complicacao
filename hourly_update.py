from datetime import datetime, timezone
from backend.news.brazil import fetch_brazil_news
from backend.news.international import fetch_international_news
from backend.market.indicators import fetch_real_market_data

def run_update() -> dict:
    started_at = datetime.now(timezone.utc)

    brazil = fetch_brazil_news()
    international = fetch_international_news()
    indicators = fetch_real_market_data()

    # Em produção:
    # validar -> normalizar -> cruzar fontes -> deduplicar ->
    # detectar atualizações -> persistir -> reavaliar destaques ->
    # atualizar textos e gráficos juntos -> registrar execução.
    return {
        "startedAt": started_at.isoformat(),
        "brazilFound": len(brazil),
        "internationalFound": len(international),
        "indicatorsFound": len(indicators),
        "status": "no_sources_configured" if not (brazil or international or indicators) else "processed"
    }

if __name__ == "__main__":
    print(run_update())
