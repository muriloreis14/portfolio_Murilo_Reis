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
});
