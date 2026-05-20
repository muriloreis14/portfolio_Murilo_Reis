import yfinance as yf
import json
import os
import urllib.request
import xml.etree.ElementTree as ET
import email.utils
from datetime import datetime
import time
import random

# 1. CAMINHOS BLINDADOS
diretorio_base = os.path.dirname(os.path.abspath(__file__))
caminho_lista = os.path.join(diretorio_base, 'base_de_dados', 'lista_ativos.json')
pasta_noticias = os.path.join(diretorio_base, 'base_de_dados', 'noticias')

os.makedirs(pasta_noticias, exist_ok=True)
with open(os.path.join(pasta_noticias, '.gitkeep'), 'w') as f:
    f.write('')

try:
    with open(caminho_lista, 'r', encoding='utf-8') as f:
        dados_lista = json.load(f)
        tickers = dados_lista if isinstance(dados_lista, list) else dados_lista.get('tickers', [])
except Exception as e:
    print(f"Erro ao ler a lista de ativos: {e}")
    tickers = []

print(f"Iniciando coleta MISTA (Global + Nacional) para {len(tickers)} ativos...")

for ticker in tickers:
    print(f"A recolher dados para: {ticker}...")
    noticias_combinadas = []
    
    # ---------------------------------------------------------
    # FONTE 1: YAHOO FINANCE (Internacional)
    # ---------------------------------------------------------
    try:
        acao = yf.Ticker(f"{ticker}.SA")
        for item in acao.news:
            titulo = item.get('title') or item.get('content', {}).get('title') or "Sem título"
            link = item.get('link') or item.get('content', {}).get('canonicalUrl', {}).get('url') or "#"
            fonte = item.get('publisher') or item.get('content', {}).get('provider', {}).get('displayName') or "Yahoo Finance"
            
            timestamp = item.get('providerPublishTime')
            data_legivel = datetime.fromtimestamp(timestamp).strftime('%d/%m/%Y') if timestamp else "Data desconhecida"
                
            noticias_combinadas.append({
                "titulo": titulo,
                "link": link,
                "fonte": fonte,
                "data": data_legivel
            })
    except Exception as e:
        print(f"  -> Erro no Yahoo para {ticker}: {e}")

    # ---------------------------------------------------------
    # FONTE 2: GOOGLE NEWS BRASIL (Nacional)
    # ---------------------------------------------------------
    try:
        url = f"https://news.google.com/rss/search?q={ticker}+ação+bolsa&hl=pt-BR&gl=BR&ceid=BR:pt-419"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        req = urllib.request.Request(url, headers=headers)
        resposta = urllib.request.urlopen(req)
        root = ET.fromstring(resposta.read())
        
        # Pega as 6 melhores nacionais para mesclar
        for item in root.findall('./channel/item')[:6]:
            titulo_completo = item.find('title').text
            link = item.find('link').text
            data_publicacao = item.find('pubDate').text
            
            if " - " in titulo_completo:
                titulo, fonte = titulo_completo.rsplit(" - ", 1)
            else:
                titulo = titulo_completo
                fonte = "Portal Nacional"
            
            data_formatada = "Data desconhecida"
            if data_publicacao:
                try:
                    tupla_data = email.utils.parsedate_tz(data_publicacao)
                    if tupla_data:
                        ano, mes, dia = tupla_data[0], tupla_data[1], tupla_data[2]
                        data_formatada = f"{dia:02d}/{mes:02d}/{ano}"
                except:
                    pass
            
            # Evita duplicados verificando se o link já foi guardado
            if not any(n['link'] == link for n in noticias_combinadas):
                noticias_combinadas.append({
                    "titulo": titulo,
                    "link": link,
                    "fonte": fonte,
                    "data": data_formatada
                })
    except Exception as e:
        print(f"  -> Erro no Google News para {ticker}: {e}")
        
    # ---------------------------------------------------------
    # GUARDA O FICHEIRO (Limitado às 12 notícias mais relevantes)
    # ---------------------------------------------------------
    if noticias_combinadas:
        caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(noticias_combinadas[:12], f, ensure_ascii=False, indent=4)
            
    # Pausa estratégica para enganar o bloqueio do Google
    time.sleep(random.uniform(1.5, 3.5))

print("✅ Coleta de notícias MISTA concluída com sucesso!")
