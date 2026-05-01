import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def get_sgs_data(codigo, inicio, fim):
    url = f'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json&dataInicial={inicio}&dataFinal={fim}'
    df = pd.read_json(url)
    df['data'] = pd.to_datetime(df['data'], dayfirst=True)
    return df

def atualizar_dados():
    os.makedirs('base_de_dados', exist_ok=True)
    os.makedirs('arquivos_download', exist_ok=True)
    
    fim_dt = datetime.now()
    ini_dt = fim_dt - timedelta(days=400)
    data_fim = fim_dt.strftime('%d/%m/%Y')
    data_ini = ini_dt.strftime('%d/%m/%Y')

    # --- 1. IBOVESPA & CÂMBIO (Yahoo Finance) ---
    tickers = {"^BVSP": "ibov", "USDBRL=X": "cambio"}
    for ticker, nome in tickers.items():
        data = yf.download(ticker, start=ini_dt, end=fim_dt, interval='1mo')
        df_temp = data[['Close']].reset_index()
        df_temp['Date'] = df_temp['Date'].dt.strftime('%Y-%m')
        
        # JSON para o site
        json_data = {
            "nome": f"Evolução {nome.upper()}",
            "periodos": df_temp['Date'].tolist(),
            "valores": df_temp['Close'].round(2).tolist()
        }
        with open(f'base_de_dados/series_{nome}.json', 'w') as f:
            json.dump(json_data, f, indent=4)
        
        # CSV para download
        df_temp.to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';')

    # --- 2. SELIC, IPCA & PIB (Banco Central) ---
    series_bcb = {
        "1178": "selic",  # Selic Meta anualizada
        "433": "ipca",    # IPCA variação mensal %
        "22109": "pib"    # PIB trimestral valores correntes
    }

    for codigo, nome in series_bcb.items():
        try:
            df_bcb = get_sgs_data(codigo, data_ini, data_fim)
            
            # Ajuste de data para o formato do site
            df_bcb['mes'] = df_bcb['data'].dt.strftime('%Y-%m')
            
            # No caso do PIB trimestral, ele virá apenas nos meses de fechamento do trimestre
            json_bcb = {
                "nome": f"Indicador {nome.upper()}",
                "periodos": df_bcb['mes'].tolist()[-12:], # Pega os últimos 12 registros
                "valores": df_bcb['valor'].tolist()[-12:]
            }
            
            with open(f'base_de_dados/series_{nome}.json', 'w') as f:
                json.dump(json_bcb, f, indent=4)
                
            df_bcb[['mes', 'valor']].tail(12).to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';')
        except Exception as e:
            print(f"Erro ao buscar {nome}: {e}")

    print(f"Sucesso! Todos os indicadores atualizados em {datetime.now()}")

if __name__ == "__main__":
    atualizar_dados()
