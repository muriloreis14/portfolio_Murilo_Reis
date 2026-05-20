import json
import os
import urllib.request
import xml.etree.ElementTree as ET
import email.utils
import time # Importante para a pausa estratégica

# 1. DEFINIÇÃO DE CAMINHOS ABSOLUTOS
diretorio_base = os.path.dirname(os.path.abspath(__file__))
caminho_lista = os.path.join(diretorio_base, 'base_de_dados', 'lista_ativos.json')
pasta_noticias = os.path.join(diretorio_base, 'base_de_dados', 'noticias')

print(f"Diretório base: {diretorio_base}")

# 2. GARANTIA DE EXISTÊNCIA DA PASTA E DO .GITKEEP
try:
    os.makedirs(pasta_noticias, exist_ok=True)
    
    # Cria um arquivo oculto para forçar o Git a rastrear a pasta, mesmo se vazia
    with open(os.path.join(pasta_noticias, '.gitkeep'), 'w') as f:
        f.write('')
        
    print(f"Pasta '{pasta_noticias}' e arquivo .gitkeep criados com sucesso.")
except Exception as e:
    print(f"AVISO: Problema ao verificar/criar a pasta: {e}")

# 3. LEITURA DA LISTA DE ATIVOS
try:
    with open(caminho_lista, 'r', encoding='utf-8') as f:
        dados_lista = json.load(f)
        if isinstance(dados_lista, list):
            tickers = dados_lista
        else:
            tickers = dados_lista.get('tickers', [])

    print(f"Iniciando a coleta via Google News para {len(tickers)} ativos...")
except Exception as e:
    print(f"ERRO CRÍTICO: Não foi possível ler o arquivo {caminho_lista}. Detalhe: {e}")
    tickers = []

# 4. MOTOR DE BUSCA DE NOTÍCIAS (GOOGLE NEWS)
for ticker in tickers:
    print(f"Buscando notícias para: {ticker}...")
    noticias_formatadas = []
    
    try:
        url = f"https://news.google.com/rss/search?q={ticker}+ação+B3&hl=pt-BR&gl=BR&ceid=BR:pt-419"
        
        # Cabeçalhos mais robustos para simular o navegador Google Chrome no Windows
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
        
        req = urllib.request.Request(url, headers=headers)
        resposta = urllib.request.urlopen(req)
        xml_data = resposta.read()
        
        root = ET.fromstring(xml_data)
        
        for item in root.findall('./channel/item')[:10]:
            titulo_completo = item.find('title').text
            link = item.find('link').text
            data_publicacao = item.find('pubDate').text
            
            if " - " in titulo_completo:
                titulo, fonte = titulo_completo.rsplit(" - ", 1)
            else:
                titulo = titulo_completo
                fonte = "Portal Financeiro"
            
            data_formatada = "Data desconhecida"
            if data_publicacao:
                try:
                    tupla_data = email.utils.parsedate_tz(data_publicacao)
                    if tupla_data:
                        ano, mes, dia = tupla_data[0], tupla_data[1], tupla_data[2]
                        data_formatada = f"{dia:02d}/{mes:02d}/{ano}"
                except:
                    pass
            
            noticias_formatadas.append({
                "titulo": titulo,
                "link": link,
                "fonte": fonte,
                "data": data_formatada
            })
            
        # Salva o arquivo da empresa
        caminho_arquivo = os.path.join(pasta_noticias, f"{ticker}.json")
        with open(caminho_arquivo, 'w', encoding='utf-8') as f:
            json.dump(noticias_formatadas, f, ensure_ascii=False, indent=4)
            
    except Exception as e:
        print(f"  -> Erro ao processar notícias de {ticker}: {e}")

    # PAUSA ESTRATÉGICA: 1.5 segundos entre cada ação para o Google não bloquear o robô
    time.sleep(1.5)

print("✅ Coleta de notícias via Google News concluída!")
