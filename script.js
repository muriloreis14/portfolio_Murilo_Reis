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
    fetch('base_de_dados/series_ibov.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoIbov.innerText = ultimoValor.toLocaleString('pt-BR') + " pts";
            elementoIbov.style.color = "#d3d3d3";
        }).catch(() => { if(elementoIbov) elementoIbov.innerText = "Erro"; });

    // 2. SELIC
    fetch('base_de_dados/series_selic.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoSelic.innerText = ultimoValor + "%";
            elementoSelic.style.color = "#d3d3d3";
        }).catch(() => { if(elementoSelic) elementoSelic.innerText = "Erro"; });

    // 3. IPCA (Acumulado 12 meses)
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
        }).catch(() => { if(elementoIpca) elementoIpca.innerText = "Erro"; });

    // 4. CÂMBIO
    fetch('base_de_dados/series_cambio.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoCambio.innerText = "R$ " + ultimoValor.toFixed(2).replace('.', ',');
            elementoCambio.style.color = "#d3d3d3";
        }).catch(() => { if(elementoCambio) elementoCambio.innerText = "Erro"; });

    // 5. DESEMPREGO
    fetch('base_de_dados/series_desemprego.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoDesemprego.innerText = ultimoValor + "%";
            elementoDesemprego.style.color = "#d3d3d3";
        }).catch(() => { if(elementoDesemprego) elementoDesemprego.innerText = "Erro"; });

    // 6. DÍVIDA PÚBLICA
    fetch('base_de_dados/series_divida_publica.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoDivida.innerText = ultimoValor + "%";
            elementoDivida.style.color = "#d3d3d3";
        }).catch(() => { if(elementoDivida) elementoDivida.innerText = "Erro"; });

    // 7. BALANÇA COMERCIAL
    fetch('base_de_dados/series_balanca_comercial.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            // Formatado com ponto nos milhares
            elementoBalanca.innerText = "US$ " + ultimoValor.toLocaleString('pt-BR');
            elementoBalanca.style.color = "#d3d3d3";
        }).catch(() => { if(elementoBalanca) elementoBalanca.innerText = "Erro"; });

    // 8. INVESTIMENTO DIRETO
    fetch('base_de_dados/series_investimento_direto.json?v=' + new Date().getTime())
        .then(res => res.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoIdp.innerText = "US$ " + ultimoValor.toLocaleString('pt-BR');
            elementoIdp.style.color = "#d3d3d3";
        }).catch(() => { if(elementoIdp) elementoIdp.innerText = "Erro"; });

    // --- MOTOR INTELIGENTE DO GRÁFICO ---
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

    // Só executa se estivermos na página de ativos (onde a barra existe)
    if (inputBusca && listaSugestoes) {
        
        // Aqui é o seu banco de dados temporário (podemos plugar o Python aqui depois!)
        const ativosB3 = [
            "ABEV3", "AZUL4", "B3SA3", "BBAS3", "BBDC4", "ELET3", 
            "ITUB4", "MGLU3", "PETR3", "PETR4", "RENT3", "SUZB3", 
            "VALE3", "VIVA3", "WEGE3"
        ];

        // A cada vez que o usuário digita uma letra, essa função roda
        inputBusca.addEventListener("input", function() {
            const textoDigitado = inputBusca.value.toUpperCase(); // Tudo em maiúsculo
            
            // Se apagar tudo, esconde a caixinha
            if (textoDigitado === "") {
                listaSugestoes.innerHTML = "";
                listaSugestoes.classList.add("escondido");
                return;
            }

            // A MÁGICA: Filtra os ativos que começam com as letras digitadas
            const resultados = ativosB3.filter(ativo => ativo.startsWith(textoDigitado));

            // Limpa a caixa atual e injeta os novos resultados
            listaSugestoes.innerHTML = "";
            
            if (resultados.length > 0) {
                resultados.forEach(ativo => {
                    const li = document.createElement("li");
                    li.innerText = ativo;
                    
                    // O que acontece quando o usuário clica na opção do menu
                    li.addEventListener("click", function() {
                        inputBusca.value = ativo; // Preenche a barra com a escolha
                        listaSugestoes.innerHTML = ""; // Esconde a lista
                        listaSugestoes.classList.add("escondido");
                        
                        console.log("O usuário escolheu a empresa: " + ativo);
                        // FUTURO: Aqui chamaremos a função para desenhar os gráficos da empresa!
                    });
                    
                    listaSugestoes.appendChild(li);
                });
                // Mostra a lista na tela
                listaSugestoes.classList.remove("escondido");
            } else {
                listaSugestoes.classList.add("escondido");
            }
        });

        // Esconde a lista se o usuário clicar fora da barra
        document.addEventListener("click", function(evento) {
            if (evento.target !== inputBusca) {
                listaSugestoes.classList.add("escondido");
            }
        });
    }
});
