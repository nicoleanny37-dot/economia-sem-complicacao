import requests

def _get_json(url):
    response = requests.get(url, timeout=15)
    response.raise_for_status()
    return response.json()

def coletar_indicadores():
    dados = {}

    try:
        url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"
        dados["dolar_ptax"] = _get_json(url)
    except Exception as exc:
        dados["dolar_ptax"] = {"erro": str(exc)}

    # Reservados para integrações oficiais/fornecedores específicos.
    dados["ibovespa"] = None
    dados["selic"] = None
    dados["brent"] = None
    return dados
