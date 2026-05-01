import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def atualizar_dados():
    # Cria as pastas caso não existam
    os.makedirs('base_de_dados', exist_ok=True)
    os.makedirs('arquivos_download', exist_ok=True)

    simbolo = "^BVSP"
    # Aumentamos a margem para garantir que pegamos 12 fechamentos mensais
    fim = datetime.now()
    inicio = fim - timedelta(days=400)

    # Ticker explícito e download forçado
    ticker = yf.Ticker(simbolo)
    ibov = ticker.history(start=inicio, end=fim, interval='1mo')

    if ibov.empty:
        raise Exception("Erro crítico: O Yahoo Finance não retornou dados para o Ibovespa.")

    df = ibov[['Close']].reset_index()
    df['Date'] = df['Date'].dt.strftime('%Y-%m')
    df.columns = ['mes', 'fechamento']

    # Garante que os valores sejam numéricos e limpos
    df['fechamento'] = df['fechamento'].round(2)

    # ---------------------------------------------------------
    # NOVO FORMATO DO JSON (Ideal para o Chart.js)
    # ---------------------------------------------------------
    dados_grafico = {
        "nome_indicador": "Evolução do IBOVESPA (Pontos)",
        "periodos": df['mes'].tolist(),
        "valores": df['fechamento'].tolist()
    }

    # Salvando o JSON na pasta base_de_dados
    path_json = os.path.join('base_de_dados', 'historico_ibov.json')
    with open(path_json, 'w', encoding='utf-8') as f:
        json.dump(dados_grafico, f, indent=4, ensure_ascii=False)

    # ---------------------------------------------------------
    # MANTENDO O SEU CSV PARA DOWNLOAD INTACTO
    # ---------------------------------------------------------
    path_csv = os.path.join('arquivos_download', 'series_ibovespa.csv')
    df.to_csv(path_csv, index=False, sep=';', encoding='utf-8-sig')

    print(f"Sucesso! Arquivos gerados em {datetime.now()}")

if __name__ == "__main__":
    atualizar_dados()
