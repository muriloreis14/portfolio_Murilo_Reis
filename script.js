// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // Captura os elementos dos cards
    const elementoIbov = document.getElementById("valor-ibov");
    const elementoSelic = document.getElementById("valor-selic");
    const elementoIpca = document.getElementById("valor-ipca");
    const elementoCambio = document.getElementById("valor-cambio");

    // 1. DADOS AUTOMÁTICOS: Card do IBOVESPA
    fetch('base_de_dados/series_ibov.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoIbov.innerText = ultimoValor.toLocaleString('pt-BR') + " pts";
            elementoIbov.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro IBOVESPA:", erro);
            if(elementoIbov) elementoIbov.innerText = "Erro";
        });

    // 2. DADOS AUTOMÁTICOS: Card da SELIC
    fetch('base_de_dados/series_selic.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoSelic.innerText = ultimoValor + "%";
            elementoSelic.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro Selic:", erro);
            if(elementoSelic) elementoSelic.innerText = "Erro";
        });

    // 3. DADOS AUTOMÁTICOS: Card do IPCA (Acumulado 12 meses)
    fetch('base_de_dados/series_ipca.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            // Pega apenas os últimos 12 meses da lista
            let ultimos12 = dados.valores.slice(-12);
            
            // Faz o cálculo de juros compostos para a inflação acumulada
            let acumulado = 1;
            for(let i = 0; i < ultimos12.length; i++) {
                acumulado = acumulado * (1 + (ultimos12[i] / 100));
            }
            acumulado = (acumulado - 1) * 100;
            
            // Formata com 2 casas decimais e vírgula
            elementoIpca.innerText = acumulado.toFixed(2).replace('.', ',') + "%";
            elementoIpca.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro IPCA:", erro);
            if(elementoIpca) elementoIpca.innerText = "Erro";
        });

    // 4. DADOS AUTOMÁTICOS: Card do Câmbio (Dólar)
    fetch('base_de_dados/series_cambio.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            let ultimoValor = dados.valores[dados.valores.length - 1];
            // Formata o valor como moeda (Ex: R$ 4,96)
            elementoCambio.innerText = "R$ " + ultimoValor.toFixed(2).replace('.', ',');
            elementoCambio.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro Câmbio:", erro);
            if(elementoCambio) elementoCambio.innerText = "Erro";
        });

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
});
