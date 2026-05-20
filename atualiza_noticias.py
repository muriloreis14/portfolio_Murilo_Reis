import yfinance as yf
import json
import os
from datetime import datetime
import time

# 1. CAMINHOS BLINDADOS
diretorio_base = os.path.dirname(os.path.abspath(__file__))
caminho_lista = os.path.join(diretorio_base, 'base_de_dados', 'lista_ativos.json')
pasta_noticias = os.path.join(diretorio_base, 'base_de_dados', 'noticias')

# 2. CRIAÇÃO DA PASTA E GITKEEP
os.makedirs(pasta_noticias, exist_ok=True)
with open(os.path.join(pasta_noticias, '.gitkeep'), 'w') as f:
    f.write('')

# 3. LEITURA DA LISTA
try:
    with open(caminho_lista, 'r', encoding='utf-8') as f:
        dados_lista = json.load(f)
        tickers = dados_lista if isinstance(dados_lista, list) else dados_lista.get('tickers', [])
except Exception as e:
    print(f"Erro ao ler lista de ativos: {e}")
    tickers = []

print(f"Iniciando coleta via Yahoo Finance para {len(tickers)} ativos...")

# 4. MOTOR DE BUSCA COM SCANNER INTELIGENTE
for ticker in tickers:
    print(f"Buscando: {ticker}...")
    ticker_sa = f"{ticker}.SA"
    noticias_formatadas = []
    
    try:
        acao = yf.Ticker(ticker_sa)
        noticias_brutas = acao.news
        
        for item in noticias_brutas:
            # O "Smart Parser": Procura nas chaves antigas e nas novas do Yahoo
            titulo = item.get('title') or item.get('content', {}).get('title') or "Sem título"
            link = item.get('link') or item.get('content', {}).get('canonicalUrl', {}).get('url') or "#"
            fonte = item.get('publisher') or item.get('content', {}).get('provider', {}).get('displayName') or "Yahoo Finance"
            
            # Tratamento da data (vem em segundos desde 1970)
            timestamp = item.get('providerPublishTime')
            data_legivel = "Data desconhecida"
            if timestamp:
                data_legivel = datetime.fromtimestamp(timestamp).strftime('%d/%m/%Y')
                
            noticias_formatadas.append({
                "titulo": titulo,
                "link": link,
                "fonte": fonte,
                "data": data_legivel
            })
            
        # Salva o arquivo apenas se tiver encontrado alguma notícia
        if noticias_formatadas:
            caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
            with open(caminho_arquivo, 'w', encoding='utf-8') as f:
                json.dump(noticias_formatadas, f, ensure_ascii=False, indent=4)
                
    except Exception as e:
        print(f"  -> Erro em {ticker}: {e}")
        
    # Uma micro pausa para não sobrecarregar a API
    time.sleep(0.5)

print("✅ Coleta de notícias concluída!")
