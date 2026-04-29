// Aguarda toda a estrutura do site carregar antes de executar os comandos
document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Capturamos os elementos da tela usando os IDs que criamos no HTML
    const elementoIbov = document.getElementById("valor-ibov");
    const elementoSelic = document.getElementById("valor-selic");

    // 2. Definimos os números que queremos exibir 
    // (Futuramente, faremos o JavaScript ler automaticamente o arquivo JSON exportado pelo seu Python)
    let valorIbovespaAtual = "128.530 pts";
    let taxaSelicAtual = "10,75%";

    // 3. Substituímos o texto "Carregando..." pelos valores das variáveis
    elementoIbov.innerText = valorIbovespaAtual;
    elementoSelic.innerText = taxaSelicAtual;

    // Bônus: Como estamos usando o Cinza Claro (#d3d3d3), garantimos que os números fiquem na cor certa
    elementoIbov.style.color = "#d3d3d3"; 
    elementoSelic.style.color = "#d3d3d3";
// --- LÓGICA DO GRÁFICO CHART.JS ---
    
    // 1. Capturamos o espaço do canvas que criamos no HTML
    const ctx = document.getElementById('graficoPib').getContext('2d');

    // 2. Criamos o gráfico
    const graficoPib = new Chart(ctx, {
        type: 'line', // Tipo do gráfico: linha
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Índice IBC-Br (Pontos)',
                data: [144.5, 145.2, 146.1, 145.8, 147.0, 147.5, 148.2, 149.0, 148.5, 150.1, 151.0, 152.3],
                borderColor: '#d3d3d3', // Cor da linha (Cinza Claro)
                backgroundColor: 'rgba(211, 211, 211, 0.1)', // Um fundo cinza bem transparente abaixo da linha
                borderWidth: 2,
                tension: 0.3, // Deixa a linha levemente curvada/suave
                fill: true // Preenche a área abaixo da linha
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#d3d3d3' } // Cor do texto da legenda
                }
            },
            scales: {
                x: { 
                    ticks: { color: '#a0a0a0' }, // Cor dos meses no eixo X
                    grid: { color: '#333' } // Cor das linhas de grade
                },
                y: { 
                    ticks: { color: '#a0a0a0' }, // Cor dos números no eixo Y
                    grid: { color: '#333' } 
                }
            }
        }
    });});
