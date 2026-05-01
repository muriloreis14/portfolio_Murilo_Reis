import yfinance as yf
import pandas as pd
import json
from datetime import datetime, timedelta

def atualizar_dados():
    # 1. Definir o período (últimos 12 meses)
    simbolo = "^BVSP"
    fim = datetime.now()
    inicio = fim - timedelta(days=365)

    # 2. Buscar os dados mensais
    # '1mo' traz o fechamento de cada mês
    ibov = yf.download(simbolo, start=inicio, end=fim, interval='1mo')

    if ibov.empty:
        print("Erro: Não foi possível buscar os dados.")
        return

    # Limpar o DataFrame para pegar apenas o Fechamento (Close)
    # Resetamos o index para a data virar uma coluna comum
    df = ibov[['Close']].reset_index()
    df['Date'] = df['Date'].dt.strftime('%Y-%m') # Formata para Ano-Mês
    df.columns = ['mes', 'fechamento']

    # 3. Gerar o arquivo JSON (para o site)
    dados_json = df.to_dict(orient='records')
    with open('series_ibovespa.json', 'w', encoding='utf-8') as f:
        json.dump(dados_json, f, ensure_ascii=False, indent=4)

    # 4. Gerar o arquivo CSV (para o botão de download no futuro)
    df.to_csv('series_ibovespa.csv', index=False, sep=';', encoding='utf-8-sig')

    print("Arquivos series_ibovespa.json e .csv gerados com sucesso!")

if __name__ == "__main__":
    atualizar_dados()
