def anexar_imagem(materia):
    # Não baixa imagens de fontes aleatórias.
    # Integre aqui um provedor autorizado ou use imagens próprias.
    materia.setdefault("image_url", "")
    materia.setdefault("image_credit", "")
    return materia
