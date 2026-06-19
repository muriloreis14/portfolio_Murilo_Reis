// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // Captura os elementos dos 8 cards
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

    // --- MOTOR INTELIGENTE DO GRÁFICO DA HOME ---
    const seletor = document.getElementById("seletor-indicador");
    let graficoAtual = null;

    function desenharGrafico(nomeDoArquivo) {
        fetch(nomeDoArquivo + '?v=' + new Date().getTime())
            .then(resposta => resposta.json())
            .then(dados => {
                const ctx = document.getElementById('graficoPib').getContext('2d');

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
            .catch(erro => console.log("Erro ao desenhar o gráfico:", erro));
    }

    if (seletor) {
        seletor.addEventListener("change", function() {
            desenharGrafico(seletor.value); 
        });
        desenharGrafico(seletor.value);
    }

    // ==============================================================
    // --- LÓGICA DA BARRA DE BUSCA (PÁGINA: ANÁLISE DE ATIVOS) ---
    // ==============================================================
    const inputBusca = document.getElementById("input-busca");
    const listaSugestoes = document.getElementById("lista-sugestoes");

    // Variáveis globais para o painel de ativos
    let graficoAtivoAtual = null;
    let dadosCompletosAtivo = null; 
    let dadosCompletosIbov = null; // Guarda o histórico do IBOVESPA diário
    let tickerAtivoAtual = "";    // Guarda o ticker que está na tela

    // Função que carrega e renderiza os dados comparativos
    function carregarDadosAtivo(ticker) {
        tickerAtivoAtual = ticker;
        const painel = document.getElementById("painel-empresa");
        const tituloAtivo = document.getElementById("titulo-empresa");
        const cardValor = document.getElementById("valor-ativo");
        const logoEmpresa = document.getElementById("logo-empresa");
        const listaNoticias = document.getElementById("lista-noticias");
        
        listaNoticias.innerHTML = "<li>Carregando notícias...</li>";
        painel.style.display = "block"; 
        tituloAtivo.innerText = ticker;
        cardValor.innerText = "Carregando...";

        // Carrega o logotipo da empresa
        logoEmpresa.src = `https://raw.githubusercontent.com/thefintz/icones-b3/main/icones/${ticker}.png`;
        logoEmpresa.style.display = "block";
        logoEmpresa.onerror = function() { this.style.display = "none"; };

        // --- BUSCADOR DE NOTÍCIAS ---
        fetch(`base_de_dados/noticias/${ticker}.json?v=` + new Date().getTime())
            .then(res => res.json())
            .then(noticias => {
                listaNoticias.innerHTML = "";
                if (noticias.length === 0) {
                    listaNoticias.innerHTML = "<li>Nenhuma notícia recente encontrada.</li>";
                    return;
                }
                noticias.slice(0, 12).forEach(noticia => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <span class="data-fonte">${noticia.data} • <span class="destaque-fonte">${noticia.fonte}</span></span>
                        <a href="${noticia.link}" target="_blank" class="link-noticia">${noticia.titulo}</a>
                    `;
                    listaNoticias.appendChild(li);
                });
            })
            .catch(() => {
                listaNoticias.innerHTML = "<li>O robô de notícias ainda não coletou dados para este ativo.</li>";
            });

        // Resetar os botões de filtro para o padrão MÁX
        document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
        const btnMax = document.querySelector('.btn-filtro[data-periodo="MAX"]');
        if (btnMax) btnMax.classList.add('ativo');

        // --- CARREGAMENTO EM PARALELO: AÇÃO + IBOVESPA ---
        Promise.all([
            fetch(`base_de_dados/ativos/${ticker}.json?v=` + new Date().getTime()).then(res => res.json()),
            fetch(`base_de_dados/ativos/IBOV_diario.json?v=` + new Date().getTime()).then(res => res.json())
        ])
        .then(([dadosAcao, dadosIbov]) => {
            dadosCompletosAtivo = dadosAcao;
            dadosCompletosIbov = dadosIbov;

            // Mostra o preço bruto atual no card em R$
            let ultimoPreco = dadosAcao.valores[dadosAcao.valores.length - 1];
            cardValor.innerText = "R$ " + ultimoPreco.toFixed(2).replace('.', ',');
            
            // Plota o gráfico inicial no modo MÁX
            atualizarGraficoComparativo('MAX');
        })
        .catch(erro => {
            console.error("Erro ao carregar dados do ativo/Ibov:", erro);
            cardValor.innerText = "Erro nos dados";
        });
    }

    // Função interna que filtra as datas e calcula o retorno percentual acumulado
    function atualizarGraficoComparativo(periodo) {
        if (!dadosCompletosAtivo || !dadosCompletosIbov) return;

        const totalDiasAcao = dadosCompletosAtivo.periodos.length;
        let diasParaMostrar = totalDiasAcao;

        if (periodo === '1S') diasParaMostrar = 5;
        else if (periodo === '1M') diasParaMostrar = 21;
        else if (periodo === '1A') diasParaMostrar = 252;
        else if (periodo === '5A') diasParaMostrar = 1260;

        if (diasParaMostrar > totalDiasAcao) diasParaMostrar = totalDiasAcao;

        // Recorta as datas e valores originais da ação para a janela escolhida
        const periodosFiltrados = dadosCompletosAtivo.periodos.slice(-diasParaMostrar);
        const valoresAcaoBrutos = dadosCompletosAtivo.valores.slice(-diasParaMostrar);

        // Preços de referência iniciais para o cálculo do percentual
        const precoInicialAcao = valoresAcaoBrutos[0];

        // Mapeia os valores da Ação para Rentabilidade Acumulada (%)
        const valoresAcaoPercentual = valoresAcaoBrutos.map(v => ((v / precoInicialAcao) - 1) * 100);

        // Alinha os pontos do IBOVESPA com as mesmas datas da ação para evitar furos no gráfico
        const valoresIbovPercentual = [];
        let primeiroValorIbovValido = null;

        // Cria um dicionário rápido { data: valor } para o Ibovespa rodar em O(n)
        const mapaIbov = {};
        for (let i = 0; i < dadosCompletosIbov.periodos.length; i++) {
            mapaIbov[dadosCompletosIbov.periodos[i]] = dadosCompletosIbov.valores[i];
        }

        // Primeiro, descobre qual é o valor base do Ibov na data de início do gráfico
        for (let j = 0; j < periodosFiltrados.length; j++) {
            const dataAtual = periodosFiltrados[j];
            if (mapaIbov[dataAtual] !== undefined) {
                primeiroValorIbovValido = mapaIbov[dataAtual];
                break;
            }
        }

        // Constrói a série histórica percentual do Ibov casando com os dias da ação
        let ultimoValorIbovConhecido = primeiroValorIbovValido || 100000; // fallback de segurança
        for (let j = 0; j < periodosFiltrados.length; j++) {
            const dataAtual = periodosFiltrados[j];
            if (mapaIbov[dataAtual] !== undefined) {
                ultimoValorIbovConhecido = mapaIbov[dataAtual];
            }
            
            if (primeiroValorIbovValido) {
                let rentabilidadeIbov = ((ultimoValorIbovConhecido / primeiroValorIbovValido) - 1) * 100;
                valoresIbovPercentual.push(rentabilidadeIbov);
            } else {
                valoresIbovPercentual.push(0);
            }
        }

        // Renderização ou atualização do Chart.js
        const ctx = document.getElementById('graficoAtivo').getContext('2d');
        if (graficoAtivoAtual !== null) {
            graficoAtivoAtual.destroy();
        }

        graficoAtivoAtual = new Chart(ctx, {
            type: 'line',
            data: {
                labels: periodosFiltrados,
                datasets: [
                    {
                        label: `${tickerAtivoAtual} (%)`,
                        data: valoresAcaoPercentual,
                        borderColor: '#ffffff',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderWidth: 2.5,
                        pointRadius: 0,
                        tension: 0.1,
                        fill: true
                    },
                    {
                        label: 'IBOVESPA (%)',
                        data: valoresIbovPercentual,
                        borderColor: '#4CAF50', // Verde para destacar o benchmark
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        tension: 0.1,
                        borderDash: [4, 4] // Linha tracejada elegante
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: { 
                    legend: { labels: { color: '#d3d3d3' } },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                },
                scales: {
                    x: { ticks: { color: '#a0a0a0' }, grid: { color: '#2a2a2a' } },
                    y: { 
                        ticks: { 
                            color: '#a0a0a0',
                            callback: function(value) { return value.toFixed(0) + '%'; }
                        }, 
                        grid: { color: '#2a2a2a' } 
                    }
                }
            }
        });
    }

    // Escuta os cliques nos botões de filtro de tempo (1S, 1M, 1A, etc)
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-filtro')) {
            if (!dadosCompletosAtivo || !graficoAtivoAtual) return;

            document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('ativo'));
            e.target.classList.add('ativo');

            const periodo = e.target.getAttribute('data-periodo');
            atualizarGraficoComparativo(periodo);
        }
    });

    // Mantém o monitoramento da barra de busca por digitação (Inalterado)
    if (inputBusca && listaSugestoes) {
        let ativosB3 = [];

        fetch('base_de_dados/lista_ativos.json?v=' + new Date().getTime())
            .then(res => res.json())
            .then(dados => ativosB3 = dados.tickers)
            .catch(erro => console.log("Erro ao carregar a lista de ativos:", erro));

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
    }

});
