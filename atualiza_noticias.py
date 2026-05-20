import yfinance as yf
import json
import os
from datetime import datetime

# Define os caminhos
caminho_lista = 'base_de_dados/lista_ativos.json'
pasta_noticias = 'base_de_dados/noticias'

# Garante que a pasta de notícias existe
os.makedirs(pasta_noticias, exist_ok=True)

# 1. Abre a lista de ativos
with open(caminho_lista, 'r', encoding='utf-8') as f:
    dados_lista = json.load(f)
    # Proteção: verifica se o arquivo é uma lista ou um dicionário
    if isinstance(dados_lista, list):
        tickers = dados_lista
    else:
        tickers = dados_lista.get('tickers', [])

print(f"Iniciando a coleta de notícias para {len(tickers)} ativos...")

# 2. Percorre cada ativo
for ticker in tickers:
    ticker_sa = f"{ticker}.SA"
    print(f"Buscando notícias para: {ticker}...")
    
    try:
        # Chama a API do Yahoo Finance
        acao = yf.Ticker(ticker_sa)
        
        # O comando .news puxa um resumo das matérias mais recentes
        noticias_brutas = acao.news
        noticias_formatadas = []
        
        for item in noticias_brutas:
            # O Yahoo entrega a data em "Unix Timestamp" (segundos). Precisamos converter para DD/MM/AAAA.
            timestamp = item.get('providerPublishTime')
            data_legivel = datetime.fromtimestamp(timestamp).strftime('%d/%m/%Y') if timestamp else "Data desconhecida"
            
            # Monta o pacotinho de dados no exato formato que o seu JavaScript espera
            noticias_formatadas.append({
                "titulo": item.get('title', 'Sem título'),
                "link": item.get('link', '#'),
                "fonte": item.get('publisher', 'Yahoo Finance'),
                "data": data_legivel
            })
            
        # 3. Salva o micro-arquivo JSON exclusivo desta ação
        caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(noticias_formatadas, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"  -> Erro ao processar notícias de {ticker}: {e}")

print("✅ Coleta de notícias concluída com sucesso!")
