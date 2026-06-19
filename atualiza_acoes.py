import yfinance as yf
import json
import os
import pandas as pd

# Define os caminhos do seu repositório
caminho_lista = 'base_de_dados/lista_ativos.json'
pasta_destino = 'base_de_dados/ativos'

# Garante que a pasta existe
os.makedirs(pasta_destino, exist_ok=True)

# =========================================================================
# PARTE NOVA: BAIXAR O REFERENCIAL DO IBOVESPA EM FREQUÊNCIA DIÁRIA (MÁX)
# =========================================================================
print("Baixando histórico diário do IBOVESPA para fins de comparação...")
try:
    ibov = yf.Ticker("^BVSP")
    hist_ibov = ibov.history(period="max")
    
    if not hist_ibov.empty:
        hist_ibov = hist_ibov.dropna(subset=['Close'])
        periodos_ibov = hist_ibov.index.strftime('%Y-%m-%d').tolist()
        valores_ibov = [round(val, 2) for val in hist_ibov['Close'].tolist()]
        
        dados_ibov_json = {
            "nome_indicador": "IBOVESPA",
            "periodos": periodos_ibov,
            "valores": valores_ibov
        }
        
        caminho_ibov = os.path.join(pasta_destino, "IBOV_diario.json")
        with open(caminho_ibov, 'w', encoding='utf-8') as f:
            json.dump(dados_ibov_json, f, ensure_ascii=False, indent=4)
        print("✅ Base diária do IBOVESPA salva com sucesso!")
    else:
        print("⚠️ Erro: Não foi possível obter dados para o ^BVSP.")
except Exception as e:
    print(f"⚠️ Erro ao processar o IBOVESPA diário: {e}")

print("-" * 50)

# =========================================================================
# 1. Abre a sua lista de ativos corporativos
# =========================================================================
try:
    with open(caminho_lista, 'r', encoding='utf-8') as f:
        dados_lista = json.load(f)
        tickers = dados_lista.get('tickers', [])
except Exception as e:
    print(f"Erro ao ler a lista de ativos: {e}")
    tickers = []

print(f"Iniciando o download do histórico máximo para {len(tickers)} ativos...")

# 2. Percorre cada ativo da lista
for ticker in tickers:
    ticker_sa = f"{ticker}.SA"
    print(f"Baixando: {ticker}...")
    
    try:
        # Baixa os dados desde o IPO ("max")
        acao = yf.Ticker(ticker_sa)
        hist = acao.history(period="max")
        
        # Se a tabela vier vazia, pula
        if hist.empty:
            print(f"  -> Sem dados encontrados para {ticker}.")
            continue
            
        # Limpa os dados: remove dias sem negociação (NaN)
        hist = hist.dropna(subset=['Close'])
        
        # 3. Formata os dados no padrão do dashboard
        periodos = hist.index.strftime('%Y-%m-%d').tolist()
        valores = [round(val, 2) for val in hist['Close'].tolist()]
        
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
