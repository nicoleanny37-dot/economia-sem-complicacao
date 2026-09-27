import json
import os
from dotenv import load_dotenv
from prompts.prompt_noticia import PROMPT_NOTICIA

load_dotenv()

def _sem_ia(noticia):
    resumo = noticia.get("summary_raw", "").strip()
    return {
        "title": noticia["title"],
        "category": noticia["category"],
        "date": noticia.get("published_at", ""),
        "source": noticia["source"],
        "source_url": noticia["source_url"],
        "summary": resumo,
        "what_happened": resumo,
        "context": "",
        "why_it_matters": "",
        "impact_people": "",
        "impact_companies": "",
        "glossary": "",
        "verification_status": "fonte coletada; revisão editorial recomendada",
        "image_url": "",
        "image_credit": "",
    }

def processar_noticia(noticia):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return _sem_ia(noticia)

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": PROMPT_NOTICIA},
                {"role": "user", "content": json.dumps(noticia, ensure_ascii=False)},
            ],
        )
        result = json.loads(response.choices[0].message.content)

        # Dados de origem são preservados pelo sistema.
        result["source"] = noticia["source"]
        result["source_url"] = noticia["source_url"]
        result["date"] = noticia.get("published_at", "")
        result["category"] = noticia["category"]
        return result

    except Exception as exc:
        print(f"[AVISO] IA indisponível; usando conteúdo da fonte: {exc}")
        return _sem_ia(noticia)
