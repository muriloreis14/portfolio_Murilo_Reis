// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // Captura os elementos dos cards
    const elementoIbov = document.getElementById("valor-ibov");
    const elementoSelic = document.getElementById("valor-selic");

    // 1. DADOS AUTOMÁTICOS: Lendo do SEU próprio arquivo dados.json com o "quebrador de cache"
    fetch('dados.json?v=' + new Date().getTime())
        .then(resposta => resposta.json())
        .then(dados => {
            // Substitui os valores na tela pelos dados do seu arquivo
            elementoIbov.innerText = dados.ibovespa + " pts";
            elementoIbov.style.color = "#d3d3d3";

            elementoSelic.innerText = dados.selic;
            elementoSelic.style.color = "#d3d3d3";
        })
        .catch(erro => {
            console.log("Erro ao buscar dados:", erro);
            elementoIbov.innerText = "Erro ao carregar";
        });

    // --- LÓGICA DO GRÁFICO CHART.JS ---
    const ctx = document.getElementById('graficoPib').getContext('2d');

    const graficoPib = new Chart(ctx, {
        type: 'line', 
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Índice IBC-Br (Pontos)',
                data: [144.5, 145.2, 146.1, 145.8, 147.0, 147.5, 148.2, 149.0, 148.5, 150.1, 151.0, 152.3],
                borderColor: '#d3d3d3',
                backgroundColor: 'rgba(211, 211, 211, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true 
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#d3d3d3' } 
                }
            },
            scales: {
                x: { 
                    ticks: { color: '#a0a0a0' }, 
                    grid: { color: '#333' } 
                },
                y: { 
                    ticks: { color: '#a0a0a0' }, 
                    grid: { color: '#333' } 
                }
            }
        }
    });
});
