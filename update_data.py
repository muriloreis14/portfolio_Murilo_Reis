import yfinance as yf
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def atualizar_dados():
    # Garante que as pastas existam
    os.makedirs('base_de_dados', exist_ok=True)
    os.makedirs('arquivos_download', exist_ok=True)
    
    fim_dt = datetime.now()
    ini_dt = fim_dt - timedelta(days=450)
    data_fim = fim_dt.strftime('%d/%m/%Y')
    data_ini = ini_dt.strftime('%d/%m/%Y')

    # --- 1. IBOVESPA & CÂMBIO ---
    indicadores_yf = {"^BVSP": "ibov", "USDBRL=X": "cambio"}
    for ticker, nome in indicadores_yf.items():
        try:
            df = yf.download(ticker, start=ini_dt, end=fim_dt, interval='1mo', auto_adjust=True)
            if not df.empty:
                df = df[['Close']].reset_index()
                df.columns = ['data', 'valor']
                df['data'] = df['data'].dt.strftime('%Y-%m')
                
                # Salva JSON
                output_json = {
                    "nome": f"Série {nome.upper()}",
                    "periodos": df['data'].tolist(),
                    "valores": df['valor'].round(2).tolist()
                }
                with open(f'base_de_dados/series_{nome}.json', 'w', encoding='utf-8') as f:
                    json.dump(output_json, f, indent=4)
                
                # Salva CSV
                df.to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';', encoding='utf-8-sig')
        except Exception as e:
            print(f"Erro no Yahoo ({nome}): {e}")

    # --- 2. BANCO CENTRAL (Selic, IPCA, PIB) ---
    series_bcb = {"1178": "selic", "433": "ipca", "22109": "pib"}
    for codigo, nome in series_bcb.items():
        try:
            url = f'https://api.bcb.gov.br/dados/serie/bcdata.sgs.{codigo}/dados?formato=json&dataInicial={data_ini}&dataFinal={data_fim}'
            df_bcb = pd.read_json(url)
            if not df_bcb.empty:
                df_bcb['data'] = pd.to_datetime(df_bcb['data'], dayfirst=True)
                df_bcb['mes'] = df_bcb['data'].dt.strftime('%Y-%m')
                df_final = df_bcb.tail(12) # Garante os últimos 12 meses
                
                output_json = {
                    "nome": f"Indicador {nome.upper()}",
                    "periodos": df_final['mes'].tolist(),
                    "valores": df_final['valor'].tolist()
                }
                with open(f'base_de_dados/series_{nome}.json', 'w', encoding='utf-8') as f:
                    json.dump(output_json, f, indent=4)
                
                df_final[['mes', 'valor']].to_csv(f'arquivos_download/series_{nome}.csv', index=False, sep=';', encoding='utf-8-sig')
        except Exception as e:
            print(f"Erro no BC ({nome}): {e}")

    print(f"Finalizado com sucesso: {datetime.now()}")

if __name__ == "__main__":
    atualizar_dados()
