from noticias import coletar_noticias
from deduplicacao import remover_duplicadas
from validador import validar_noticia
from processador import processar_noticia
from indicadores import coletar_indicadores
from imagens import anexar_imagem
from publicador import publicar

def main():
    noticias = remover_duplicadas(coletar_noticias())

    processadas = []
    for noticia in noticias:
        if not validar_noticia(noticia)["valida"]:
            continue
        materia = processar_noticia(noticia)
        processadas.append(anexar_imagem(materia))

    publicar(processadas, coletar_indicadores())
    print(f"Atualização concluída: {len(processadas)} notícias.")

if __name__ == "__main__":
    main()
