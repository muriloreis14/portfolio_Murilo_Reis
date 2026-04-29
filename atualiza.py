import yfinance as yf
import json

try:
    # Busca os dados do IBOVESPA no Yahoo Finance
    ibov = yf.Ticker("^BVSP")
    # Pega o último preço de fechamento
    cotacao = ibov.history(period="1d")['Close'].iloc[-1]
    
    # Formata o número para o padrão brasileiro (ex: 128.530)
    cotacao_formatada = f"{cotacao:,.0f}".replace(",", ".")

    # Prepara os dados para salvar
    dados = {
        "ibovespa": cotacao_formatada,
        "selic": "10,75%" # Futuramente, podemos automatizar a Selic via API do Banco Central
    }

    # Salva reescrevendo o seu arquivo dados.json
    with open("dadosibovespa.json", "w") as f:
        json.dump(dados, f)
        
    print("Dados atualizados com sucesso!")

except Exception as e:
    print(f"Erro ao atualizar os dados: {e}")
