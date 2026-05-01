// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // Captura os elementos dos cards
    const elementoIbov = document.getElementById("valor-ibov");
    const elementoSelic = document.getElementById("valor-selic");

    // 1. DADOS AUTOMÁTICOS: Card do IBOVESPA
    fetch('base_de_dados/series_ibov.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            // Pega o último item da lista de valores
            let ultimoValor = dados.valores[dados.valores.length - 1];
            elementoIbov.innerText = ultimoValor.toLocaleString('pt-BR') + " pts";
            elementoIbov.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro ao buscar dados do IBOVESPA para o card:", erro);
            elementoIbov.innerText = "Erro";
        });

    // 2. DADOS AUTOMÁTICOS: Card da SELIC
    fetch('base_de_dados/series_selic.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            // Pega o último item da lista de valores
            let ultimoValor = dados.valores[dados.valores.length - 1];
            // Formata adicionando o símbolo de porcentagem
            elementoSelic.innerText = ultimoValor + "%";
            elementoSelic.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro ao buscar dados da Selic para o card:", erro);
            elementoSelic.innerText = "Erro";
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

    // Escuta o clique na caixa de seleção e desenha o gráfico novo
    if (seletor) {
        seletor.addEventListener("change", function() {
            desenharGrafico(seletor.value); 
        });
        
        // Desenha o primeiro gráfico assim que a página carrega
        desenharGrafico(seletor.value);
    }
});
