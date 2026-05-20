import json
import os
import urllib.request
import xml.etree.ElementTree as ET
import email.utils

# Define os caminhos
caminho_lista = 'base_de_dados/lista_ativos.json'
pasta_noticias = 'base_de_dados/noticias'

# Garante que a pasta de notícias existe
os.makedirs(pasta_noticias, exist_ok=True)

# 1. Abre a lista de ativos
with open(caminho_lista, 'r', encoding='utf-8') as f:
    dados_lista = json.load(f)
    if isinstance(dados_lista, list):
        tickers = dados_lista
    else:
        tickers = dados_lista.get('tickers', [])

print(f"Iniciando a coleta via Google News para {len(tickers)} ativos...")

# 2. Percorre cada ativo
for ticker in tickers:
    print(f"Buscando notícias para: {ticker}...")
    noticias_formatadas = []
    
    try:
        # Busca no Google News Brasil focando na ação
        url = f"https://news.google.com/rss/search?q={ticker}+ação+B3&hl=pt-BR&gl=BR&ceid=BR:pt-419"
        
        # Disfarça o robô como um navegador normal para evitar bloqueios
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resposta = urllib.request.urlopen(req)
        xml_data = resposta.read()
        
        # Lê a estrutura XML
        root = ET.fromstring(xml_data)
        
        # Pega as 10 notícias mais recentes
        for item in root.findall('./channel/item')[:10]:
            titulo_completo = item.find('title').text
            link = item.find('link').text
            data_publicacao = item.find('pubDate').text
            
            # O Google sempre coloca " - Nome do Portal" no final. Vamos separar para ficar bonito!
            if " - " in titulo_completo:
                titulo, fonte = titulo_completo.rsplit(" - ", 1)
            else:
                titulo = titulo_completo
                fonte = "Portal Financeiro"
            
            # Converte a data maluca do RSS para o nosso padrão DD/MM/AAAA
            data_formatada = "Data desconhecida"
            if data_publicacao:
                try:
                    # Quebra a data no formato mundial
                    tupla_data = email.utils.parsedate_tz(data_publicacao)
                    if tupla_data:
                        ano, mes, dia = tupla_data[0], tupla_data[1], tupla_data[2]
                        # Formata com zeros à esquerda (ex: 05/09/2026)
                        data_formatada = f"{dia:02d}/{mes:02d}/{ano}"
                except:
                    pass
            
            # Adiciona ao nosso pacotinho
            noticias_formatadas.append({
                "titulo": titulo,
                "link": link,
                "fonte": fonte,
                "data": data_formatada
            })
            
        # Salva o arquivo da empresa
        caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(noticias_formatadas, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"  -> Erro ao processar notícias de {ticker}: {e}")

print("✅ Coleta de notícias via Google News concluída com sucesso!")
