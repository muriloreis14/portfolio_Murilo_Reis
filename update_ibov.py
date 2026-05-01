import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def atualizar_dados():
    # Criar as pastas se elas não existirem
    os.makedirs('Base de Dados', exist_ok=True)
    os.makedirs('arquivos download', exist_ok=True)

    simbolo = "^BVSP"
    fim = datetime.now()
    inicio = fim - timedelta(days=365)

    ibov = yf.download(simbolo, start=inicio, end=fim, interval='1mo')

    if ibov.empty:
        print("Erro: Não foi possível buscar os dados.")
        return

    df = ibov[['Close']].reset_index()
    df['Date'] = df['Date'].dt.strftime('%Y-%m')
    df.columns = ['mes', 'fechamento']

    # 3. Gerar o arquivo JSON na pasta "Base de Dados"
    path_json = os.path.join('Base de Dados', 'series_ibovespa.json')
    dados_json = df.to_dict(orient='records')
    with open(path_json, 'w', encoding='utf-8') as f:
        json.dump(dados_json, f, ensure_ascii=False, indent=4)

    # 4. Gerar o arquivo CSV na pasta "arquivos download"
    path_csv = os.path.join('arquivos download', 'series_ibovespa.csv')
    df.to_csv(path_csv, index=False, sep=';', encoding='utf-8-sig')

    print("Pastas e arquivos atualizados com sucesso!")

if __name__ == "__main__":
    atualizar_dados()
