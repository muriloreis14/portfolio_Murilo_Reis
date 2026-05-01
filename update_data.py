import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def get_sgs_data(codigo, inicio, fim):
    # Mudamos para uma abordagem de leitura mais segura
    url = f'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json&dataInicial={inicio}&dataFinal={fim}'
    try:
        df = pd.read_json(url)
        if df.empty:
            return pd.DataFrame()
        df['data'] = pd.to_datetime(df['data'], dayfirst=True)
        # Garantir que o valor seja numérico
        df['valor'] = pd.to_numeric(df['valor'], errors='coerce')
        return df
    except Exception as e:
        print(f"Erro ao acessar série {codigo}: {e}")
        return pd.DataFrame()

def atualizar_dados():
    os.makedirs('base_de_dados', exist_ok=True)
    os.makedirs('arquivos_download', exist_ok=True)
    
    fim_dt = datetime.now()
    ini_dt = fim_dt - timedelta(days=450) # Aumentamos a margem para o PIB trimestral
    data_fim = fim_dt.strftime('%d/%m/%Y')
    data_ini = ini_dt.strftime('%d/%m/%Y')

    # --- 1. IBOVESPA & CÂMBIO (Yahoo Finance) ---
    tickers = {"^BVSP": "ibov", "USDBRL=X": "cambio"}
    for ticker, nome in tickers.items():
        try:
            # Usando auto_adjust para evitar problemas com colunas extras
            data = yf.download(ticker, start=ini_dt, end=fim_dt, interval='1mo', auto_adjust=True)
            if not data.empty:
                df_temp = data[['Close']].reset_index()
                df_temp.columns = ['Date', 'Close'] # Padroniza nomes
                df_temp['Date'] = df_temp['Date'].dt.strftime('%Y-%m')
                
                json_data = {
                    "nome": f"Evolução {nome.upper()}",
                    "periodos": df_temp['Date'].tolist(),
                    "valores": df_temp['Close'].round(2).tolist()
                }
                with open(f'base_de_dados/series_{nome}.json', 'w', encoding='utf-8') as f:
                    json.dump(json_data, f, indent=4, ensure_ascii=False)
                
                df_temp.to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';', encoding='utf-8-sig')
        except Exception as e:
            print(f"Erro no Yahoo Finance ({nome}): {e}")

    # --- 2. SELIC, IPCA & PIB (Banco Central) ---
    series_bcb = {
        "1178": "selic",  
        "433": "ipca",    
        "22109": "pib"    
    }

    for codigo, nome in series_bcb.items():
        df_bcb = get_sgs_data(codigo, data_ini, data_fim)
        
        if not df_bcb.empty:
            df_bcb['mes'] = df_bcb['data'].dt.strftime('%Y-%m')
            
            # Filtramos para pegar os últimos 12 registros válidos
            df_final = df_bcb.dropna(subset=['valor']).tail(12)
            
            json_bcb = {
                "nome": f"Indicador {nome.upper()}",
                "periodos": df_final['mes'].tolist(),
                "valores": df_final['valor'].tolist()
            }
            
            with open(f'base_de_dados/series_{nome}.json', 'w', encoding='utf-8') as f:
                json.dump(json_bcb, f, indent=4, ensure_ascii=False)
                
            df_final[['mes', 'valor']].to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';', encoding='utf-8-sig')

    print(f"Processo finalizado em {datetime.now()}")

if __name__ == "__main__":
    atualizar_dados()
