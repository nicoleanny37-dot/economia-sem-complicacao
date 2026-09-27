from pathlib import Path
import json
from datetime import datetime, timezone

BASE = Path(__file__).resolve().parent
DATA = BASE / "dados"
DATA.mkdir(exist_ok=True)

def publicar(noticias, indicadores):
    (DATA / "noticias.json").write_text(
        json.dumps({
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "news": noticias
        }, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )

    (DATA / "indicadores.json").write_text(
        json.dumps(indicadores, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
