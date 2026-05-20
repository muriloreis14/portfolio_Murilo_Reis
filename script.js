// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // Captura os elementos dos 8 cards da Home
    const elementoIbov = document.getElementById("valor-ibov");
    const elementoSelic = document.getElementById("valor-selic");
    const elementoIpca = document.getElementById("valor-ipca");
    const elementoCambio = document.getElementById("valor-cambio");
    const elementoDesemprego = document.getElementById("valor-desemprego");
    const elementoDivida = document.getElementById("valor-divida");
    const elementoBalanca = document.getElementById("valor-balanca");
    const elementoIdp = document.getElementById("valor-idp");

    // 1. IBOVESPA
    if (elementoIbov) {
        fetch('base_de_dados/series_ibov.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoIbov.innerText = ultimoValor.toLocaleString('pt-BR') + " pts";
                elementoIbov.style.color = "#d3d3d3";
            }).catch(() => { elementoIbov.innerText = "Erro"; });
    }

    // 2. SELIC
    if (elementoSelic) {
        fetch('base_de_dados/series_selic.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoSelic.innerText = ultimoValor + "%";
                elementoSelic.style.color = "#d3d3d3";
            }).catch(() => { elementoSelic.innerText = "Erro"; });
    }

    // 3. IPCA (Acumulado 12 meses)
    if (elementoIpca) {
        fetch('base_de_dados/series_ipca.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimos12 = dados.valores.slice(-12);
                let acumulado = 1;
                for(let i = 0; i < ultimos12.length; i++) {
                    acumulado = acumulado * (1 + (ultimos12[i] / 100));
                }
                acumulado = (acumulado - 1) * 100;
                elementoIpca.innerText = acumulado.toFixed(2).replace('.', ',') + "%";
                elementoIpca.style.color = "#d3d3d3";
            }).catch(() => { elementoIpca.innerText = "Erro"; });
    }

    // 4. CÂMBIO
    if (elementoCambio) {
        fetch('base_de_dados/series_cambio.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoCambio.innerText = "R$ " + ultimoValor.toFixed(2).replace('.', ',');
                elementoCambio.style.color = "#d3d3d3";
            }).catch(() => { elementoCambio.innerText = "Erro"; });
    }

    // 5. DESEMPREGO
    if (elementoDesemprego) {
        fetch('base_de_dados/series_desemprego.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoDesemprego.innerText = ultimoValor + "%";
                elementoDesemprego.style.color = "#d3d3d3";
            }).catch(() => { elementoDesemprego.innerText = "Erro"; });
    }

    // 6. DÍVIDA PÚBLICA
    if (elementoDivida) {
        fetch('base_de_dados/series_divida_publica.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoDivida.innerText = ultimoValor + "%";
                elementoDivida.style.color = "#d3d3d3";
            }).catch(() => { elementoDivida.innerText = "Erro"; });
    }

    // 7. BALANÇA COMERCIAL
    if (elementoBalanca) {
        fetch('base_de_dados/series_balanca_comercial.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoBalanca.innerText = "US$ " + ultimoValor.toLocaleString('pt-BR');
                elementoBalanca.style.color = "#d3d3d3";
            }).catch(() => { elementoBalanca.innerText = "Erro"; });
    }

    // 8. INVESTIMENTO DIRETO
    if (elementoIdp) {
        fetch('base_de_dados/series_investimento_direto.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                let ultimoValor = dados.valores[dados.valores.length - 1];
                elementoIdp.innerText = "US$ " + ultimoValor.toLocaleString('pt-BR');
                elementoIdp.style.color = "#d3d3d3";
            }).catch(() => { elementoIdp.innerText = "Erro"; });
    }

    // --- MOTOR DO GRÁFICO DA HOME ---
    const seletor = document.getElementById("seletor-indicador");
    let graficoAtual = null;

    function desenharGrafico(nomeDoArquivo) {
        fetch(nomeDoArquivo + '?v=' + new Date().getTime())
            .then(resposta => resposta.json())
            .then(dados => {
                const elementoCanvas = document.getElementById('graficoPib');
                if (!elementoCanvas) return;
                
                const ctx = elementoCanvas.getContext('2d');

                if (graficoAtual !== null) {
                    graficoAtual.destroy();
                }

                graficoAtual = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dados.periodos,
                        datasets: [{
                            label: dados.nome_indicador || dados.nome || "Indicador", 
                            data: dados.valores,
                            borderColor: '#d3d3d3',
                            backgroundColor: 'rgba(211, 211, 211, 0.1)',
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#d3d3d3' } } },
                        scales: {
                            x: { ticks: { color: '#a0a0a0' }, grid: { color: '#333' } },
                            y: { ticks: { color: '#a0a0a0' }, grid: { color: '#333' } }
                        }
                    }
                });
            })
            .catch(erro => console.log("Erro ao desenhar o gráfico da home:", erro));
    }

    if (seletor) {
        seletor.addEventListener("change", function() {
            desenharGrafico(seletor.value); 
        });
        desenharGrafico(seletor.value);
    }

    // ==============================================================
    // --- LÓGICA DO PAINEL DE ATIVOS (ANÁLISE DE ATIVOS) ---
    // ==============================================================
    const inputBusca = document.getElementById("input-busca");
    const listaSugestoes = document.getElementById("lista-sugestoes");

    let graficoAtivoAtual = null;
    let dadosCompletosAtivo = null; 

    function carregarDadosAtivo(ticker) {
        const painel = document.getElementById("painel-empresa");
        const tituloAtivo = document.getElementById("titulo-empresa");
        const cardValor = document.getElementById("valor-ativo");
        const logoEmpresa = document.getElementById("logo-empresa");
        const listaNoticias = document.getElementById("lista-noticias");

        if (!painel) return;

        // Ativa visibilidade e limpa estados anteriores
        painel.style.display = "block"; 
        tituloAtivo.innerText = ticker;
        cardValor.innerText = "Carregando...";
        listaNoticias.innerHTML = "<li>Carregando notícias...</li>";

        // 1. LOGO DINÂMICA VIA LINK EXTERNO B3
        logoEmpresa.src = `https://raw.githubusercontent.com/thefintz/icones-b3/main/icones/${ticker}.png`;
        logoEmpresa.style.display = "block";
        logoEmpresa.onerror = function() {
            this.style.display = "none";
        };

        // Reseta botões de filtro temporal para MÁX
        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
        const btnMax = document.querySelector('.btn-filtro[data-periodo="MAX"]');
        if (btnMax) btnMax.classList.add('ativo');

        // 2. FETCH DE NOTÍCIAS (PRÉ-PROCESSADO PYTHON)
        fetch(`base_de_dados/noticias/${ticker}.json?v=` + new Date().getTime())
            .then(res => res.json())
            .then(noticias => {
                listaNoticias.innerHTML = "";
                if (noticias.length === 0) {
                    listaNoticias.innerHTML = "<li>Nenhuma notícia recente encontrada.</li>";
                    return;
                }
                noticias.slice(0, 10).forEach(noticia => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <span class="data-fonte">${noticia.data} • ${noticia.fonte}</span>
                        <a href="${noticia.link}" target="_blank" class="link-noticia">${noticia.titulo}</a>
                    `;
                    listaNoticias.appendChild(li);
                });
            })
            .catch(() => {
                listaNoticias.innerHTML = "<li>O robô de notícias ainda não coletou dados para este ativo.</li>";
            });

        // 3. FETCH DE PREÇOS HISTÓRICOS DA AÇÃO
        fetch(`base_de_dados/ativos/${ticker}.json?v=` + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                dadosCompletosAtivo = dados;

                let ultimoPreco = dados.valores[dados.valores.length - 1];
                cardValor.innerText = "R$ " + ultimoPreco.toFixed(2).replace('.', ',');
                cardValor.style.color = "#d3d3d3";
                
                const ctx = document.getElementById('graficoAtivo').getContext('2d');
                if (graficoAtivoAtual !== null) {
                    graficoAtivoAtual.destroy();
                }

                graficoAtivoAtual = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dados.periodos,
                        datasets: [{
                            label: `Fechamento - ${ticker}`, 
                            data: dados.valores,
                            borderColor: '#d3d3d3',
                            backgroundColor: 'rgba(211, 211, 211, 0.1)',
                            borderWidth: 2,
                            tension: 0.1,
                            pointRadius: 0,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { labels: { color: '#d3d3d3' } } },
                        scales: {
                            x: { ticks: { color: '#a0a0a0' }, grid: { color: '#333' } },
                            y: { ticks: { color: '#a0a0a0' }, grid: { color: '#333' } }
                        }
                    }
                });
            })
            .catch(erro => {
                console.log("Erro ao carregar os dados de preço:", erro);
                cardValor.innerText = "Erro nos dados";
            });
    }

    // LÓGICA DOS FILTROS TEMPORAIS (1S, 1M, 1A, 5A, MÁX)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-filtro')) {
            if (!dadosCompletosAtivo || !graficoAtivoAtual) return;

            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');

            const periodo = e.target.getAttribute('data-periodo');
            const totalDias = dadosCompletosAtivo.periodos.length;
            let diasParaMostrar = totalDias;

            if (periodo === '1S') diasParaMostrar = 5;
            else if (periodo === '1M') diasParaMostrar = 21;
            else if (periodo === '1A') diasParaMostrar = 252;
            else if (periodo === '5A') diasParaMostrar = 1260;

            if (diasParaMostrar > totalDias) diasParaMostrar = totalDias;

            const periodosFiltrados = dadosCompletosAtivo.periodos.slice(-diasParaMostrar);
            const valoresFiltrados = dadosCompletosAtivo.valores.slice(-diasParaMostrar);

            graficoAtivoAtual.data.labels = periodosFiltrados;
            graficoAtivoAtual.data.datasets[0].data = valoresFiltrados;
            graficoAtivoAtual.update();
        }
    });

    // LÓGICA DE AUTOCOMPLETE DA BARRA DE PESQUISA
    if (inputBusca && listaSugestoes) {
        let ativosB3 = [];
        
        fetch('base_de_dados/lista_ativos.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => {
                // Verifica se o arquivo é uma lista direta ex: ["WEGE3", "PETR4"]
                if (Array.isArray(dados)) {
                    ativosB3 = dados;
                } 
                // Verifica se é um dicionário ex: {"tickers": ["WEGE3", "PETR4"]}
                else if (dados.tickers) {
                    ativosB3 = dados.tickers;
                }
            })
            .catch(erro => console.log("Erro ao carregar lista_ativos.json:", erro));

        inputBusca.addEventListener("input", function() {
            const textoDigitado = inputBusca.value.toUpperCase(); 
            
            if (textoDigitado === "") {
                listaSugestoes.innerHTML = "";
                listaSugestoes.classList.add("escondido");
                return;
            }

            const resultados = ativosB3.filter(ativo => ativo.startsWith(textoDigitado));
            listaSugestoes.innerHTML = "";
            
            if (resultados.length > 0) {
                resultados.forEach(ativo => {
                    const li = document.createElement("li");
                    li.innerText = ativo;
                    
                    li.addEventListener("click", function() {
                        inputBusca.value = ativo; 
                        listaSugestoes.innerHTML = ""; 
                        listaSugestoes.classList.add("escondido");
                        carregarDadosAtivo(ativo);
                    });
                    
                    listaSugestoes.appendChild(li);
                });
                listaSugestoes.classList.remove("escondido");
            } else {
                listaSugestoes.classList.add("escondido");
            }
        });

        document.addEventListener("click", function(evento) {
            if (evento.target !== inputBusca) {
                listaSugestoes.classList.add("escondido");
            }
        });
    }
});
