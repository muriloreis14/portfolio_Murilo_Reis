import json
import os
import urllib.request
import xml.etree.ElementTree as ET
import email.utils

# 1. DEFINIÇÃO DE CAMINHOS ABSOLUTOS (À prova de falhas no GitHub Actions)
# Isso garante que o robô sempre saiba onde está, não importando o servidor.
diretorio_base = os.path.dirname(os.path.abspath(__file__))
caminho_lista = os.path.join(diretorio_base, 'base_de_dados', 'lista_ativos.json')
pasta_noticias = os.path.join(diretorio_base, 'base_de_dados', 'noticias')

print(f"Diretório base: {diretorio_base}")

# 2. GARANTIA DE EXISTÊNCIA DA PASTA
try:
    if not os.path.exists(pasta_noticias):
        os.makedirs(pasta_noticias)
        print(f"Pasta '{pasta_noticias}' criada com sucesso.")
    else:
        print(f"Pasta '{pasta_noticias}' já existe.")
except Exception as e:
    print(f"AVISO: Problema ao verificar/criar a pasta: {e}")

# 3. LEITURA DA LISTA DE ATIVOS
try:
    with open(caminho_lista, 'r', encoding='utf-8') as f:
        dados_lista = json.load(f)
        # Verifica se o arquivo é uma lista ou um dicionário
        if isinstance(dados_lista, list):
            tickers = dados_lista
        else:
            tickers = dados_lista.get('tickers', [])
            
    print(f"Iniciando a coleta via Google News para {len(tickers)} ativos...")
except Exception as e:
    print(f"ERRO CRÍTICO: Não foi possível ler o arquivo {caminho_lista}. Detalhe: {e}")
    tickers = [] # Deixa a lista vazia para o robô não quebrar de forma violenta

# 4. MOTOR DE BUSCA DE NOTÍCIAS (GOOGLE NEWS)
for ticker in tickers:
    print(f"Buscando notícias para: {ticker}...")
    noticias_formatadas = []
    
    try:
        # Busca no Google News Brasil focando na ação
        url = f"https://news.google.com/rss/search?q={ticker}+ação+B3&hl=pt-BR&gl=BR&ceid=BR:pt-419"
        
        # Disfarça o robô como um navegador normal para evitar bloqueios do Google
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        resposta = urllib.request.urlopen(req)
        xml_data = resposta.read()
        
        # Lê a estrutura XML que o RSS entrega
        root = ET.fromstring(xml_data)
        
        # Pega no máximo as 10 notícias mais recentes
        for item in root.findall('./channel/item')[:10]:
            titulo_completo = item.find('title').text
            link = item.find('link').text
            data_publicacao = item.find('pubDate').text
            
            # O Google sempre coloca " - Nome do Portal" no final. Separamos aqui:
            if " - " in titulo_completo:
                titulo, fonte = titulo_completo.rsplit(" - ", 1)
            else:
                titulo = titulo_completo
                fonte = "Portal Financeiro"
            
            # Converte a data do RSS para o nosso padrão (DD/MM/AAAA)
            data_formatada = "Data desconhecida"
            if data_publicacao:
                try:
                    tupla_data = email.utils.parsedate_tz(data_publicacao)
                    if tupla_data:
                        ano, mes, dia = tupla_data[0], tupla_data[1], tupla_data[2]
                        data_formatada = f"{dia:02d}/{mes:02d}/{ano}"
                except:
                    pass
            
            # Adiciona ao nosso pacote individual da ação
            noticias_formatadas.append({
                "titulo": titulo,
                "link": link,
                "fonte": fonte,
                "data": data_formatada
            })
            
        # 5. SALVA O ARQUIVO JSON DA EMPRESA
        caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(noticias_formatadas, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"  -> Erro ao processar notícias de {ticker}: {e}")

print("✅ Coleta de notícias via Google News concluída!")
