import yfinance as yf
import json
import os
import pandas as pd

# Define os caminhos do seu repositório
caminho_lista = 'base_de_dados/lista_ativos.json'
pasta_destino = 'base_de_dados/ativos'

# Garante que a pasta existe (embora você já tenha criado)
os.makedirs(pasta_destino, exist_ok=True)

# 1. Abre a sua lista de ativos
with open(caminho_lista, 'r', encoding='utf-8') as f:
    dados_lista = json.load(f)
    tickers = dados_lista.get('tickers', [])

print(f"Iniciando o download do histórico máximo para {len(tickers)} ativos...")

# 2. Percorre cada ativo da lista
for ticker in tickers:
    # O Yahoo Finance exige o sufixo .SA para ações brasileiras
    ticker_sa = f"{ticker}.SA"
    print(f"Baixando: {ticker}...")
    
    try:
        # Baixa os dados desde o IPO ("max")
        acao = yf.Ticker(ticker_sa)
        hist = acao.history(period="max")
        
        # Se a tabela vier vazia (ação deixou de existir ou erro de digitação), pula
        if hist.empty:
            print(f"  -> Sem dados encontrados para {ticker}.")
            continue
            
        # Limpa os dados: remove dias sem negociação (NaN)
        hist = hist.dropna(subset=['Close'])
        
        # 3. Formata os dados no mesmo padrão inteligente do seu dashboard
        # Transforma as datas do índice em texto (ex: "2010-05-14")
        periodos = hist.index.strftime('%Y-%m-%d').tolist()
        
        # Pega os valores de Fechamento (Close) e arredonda para 2 casas decimais
        valores = [round(val, 2) for val in hist['Close'].tolist()]
        
        # Monta a estrutura JSON
        dados_json = {
            "nome_indicador": ticker,
            "periodos": periodos,
            "valores": valores
        }
        
        # 4. Salva o arquivo individual na pasta ativos
        caminho_arquivo = os.path.join(pasta_destino, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(dados_json, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"  -> Erro ao processar {ticker}: {e}")

print("✅ Atualização de histórico concluída com sucesso!")
