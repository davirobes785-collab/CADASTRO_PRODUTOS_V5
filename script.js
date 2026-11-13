//
// FASE 1: Modelagem dos dados (Classe Base)
//
class Produto {
    constructor(nome, preco, quantidade) {
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = parseInt(quantidade);
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

//
// FASE 2: Gerenciamento de Estado & LocalStorage
//
const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";

function salvarNoLocalStorage() {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(listaDeProdutos));
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    if (dadosSalvos) {
        const produtosObjetos = JSON.parse(dadosSalvos);
        produtosObjetos.forEach((prod) => {
            const produtoInstanciado = new Produto(prod.nome, prod.preco, prod.quantidade);
            listaDeProdutos.push(produtoInstanciado);
        });
    }
}

//
// FASE 3: Captura de Elementos do DOM
//
const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const inputBusca = document.getElementById("campo-busca");
const mensagemErroEl = document.getElementById("mensagem-erro");

// Elementos dos Modais V5
const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalMensagem = document.getElementById("modal-mensagem");
const btnConfirmarModal = document.getElementById("btn-confirmar-modal");
const btnCancelarModal = document.getElementById("btn-cancelar-modal");

const modalBootstrap = document.getElementById("modal-bootstrap");
const btnAbrirBootstrap = document.getElementById("abrir-modal-bootstrap");
const btnFecharBootstrap = document.getElementById("btn-fechar-bootstrap");

// Variável de controle para ações do modal de confirmação
let acaoConfirmacaoPendente = null;

// Função para exibir mensagem inline (substitui alert)
function mostrarErro(mensagem) {
    mensagemErroEl.textContent = mensagem;
    mensagemErroEl.classList.remove("oculto");
    
    // Some após 4 segundos automaticamente
    setTimeout(() => {
        mensagemErroEl.classList.add("oculto");
    }, 4000);
}

//
// FASE 4: Escuta de Eventos
//

// 1. Adicionar Produto pelo Formulário com validação inline
formProduto.addEventListener("submit", function (event) {
    event.preventDefault();

    const nomeInput = document.getElementById("nome").value.trim();
    const precoInput = document.getElementById("preco").value;
    const quantidadeInput = document.getElementById("quantidade").value;

    if (!nomeInput || precoInput <= 0 || quantidadeInput < 0) {
        mostrarErro("Preencha todos os campos corretamente com valores válidos.");
        return;
    }

    const novoProduto = new Produto(nomeInput, precoInput, quantidadeInput);
    listaDeProdutos.push(novoProduto);
    salvarNoLocalStorage();

    atualizarInterface();
    formProduto.reset();
});

// 2. Limpar toda a tabela (Abre o Modal de Confirmação V5)
btnLimparTudo.addEventListener("click", function () {
    if (listaDeProdutos.length === 0) {
        mostrarErro("A tabela já está vazia!");
        return;
    }

    modalMensagem.textContent = "Tem certeza que deseja remover todos os produtos do estoque?";
    acaoConfirmacaoPendente = function() {
        listaDeProdutos.length = 0;
        localStorage.removeItem(CHAVE_STORAGE);
        if (inputBusca) inputBusca.value = "";
        atualizarInterface();
    };
    
    modalConfirmacao.classList.remove("oculto");
});

// Eventos de Controle do Modal de Confirmação
btnConfirmarModal.addEventListener("click", function() {
    if (acaoConfirmacaoPendente) {
        acaoConfirmacaoPendente();
    }
    modalConfirmacao.classList.add("oculto");
    acaoConfirmacaoPendente = null;
});

btnCancelarModal.addEventListener("click", function() {
    modalConfirmacao.classList.add("oculto");
    acaoConfirmacaoPendente = null;
});

// Eventos do Modal Bootstrap (Requisito V5)
btnAbrirBootstrap.addEventListener("click", function() {
    modalBootstrap.classList.remove("oculto");
});

btnFecharBootstrap.addEventListener("click", function() {
    modalBootstrap.classList.add("oculto");
});

// 3. Escuta do evento "input" para filtragem instantânea
inputBusca.addEventListener("input", function () {
    atualizarInterface();
});

//
// FASE 5: Funções de Atualização, Filtragem e Renderização
//

// Função para remover um único produto com Modal de Confirmação V5
function removerProduto(produtoParaRemover) {
    modalMensagem.textContent = `Tem certeza que deseja remover o produto "${produtoParaRemover.nome}"?`;
    
    acaoConfirmacaoPendente = function() {
        const index = listaDeProdutos.indexOf(produtoParaRemover);
        if (index !== -1) {
            listaDeProdutos.splice(index, 1);
            salvarNoLocalStorage();
            atualizarInterface();
        }
    };

    modalConfirmacao.classList.remove("oculto");
}

function obterProdutosFiltrados() {
    const termoBusca = inputBusca.value.toLowerCase().trim();
    return listaDeProdutos.filter((produto) => {
        return produto.nome.toLowerCase().includes(termoBusca);
    });
}

function atualizarTotalEstoque(produtosVisiveis) {
    const total = produtosVisiveis.reduce((acc, produto) => {
        return acc + produto.calcularSubtotal();
    }, 0);

    totalEstoqueEl.textContent = `Total em Estoque: R$ ${total.toFixed(2)}`;
}

function renderizarTabela(produtosParaExibir) {
    const tabelaBody = document.querySelector("#tabela-produtos tbody");
    tabelaBody.innerHTML = "";

    if (produtosParaExibir.length === 0) {
        const linhaVazia = document.createElement("tr");
        linhaVazia.innerHTML = `
            <td colspan="5" class="sem-resultados">
                ${listaDeProdutos.length === 0 ? "Nenhum produto cadastrado." : "Nenhum produto encontrado com o termo pesquisado."}
            </td>
        `;
        tabelaBody.appendChild(linhaVazia);
        return;
    }

    produtosParaExibir.forEach((produto) => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>R$ ${produto.calcularSubtotal().toFixed(2)}</td>
            <td>
                <button class="btn-remover">Remover</button>
            </td>
        `;

        const btnRemover = linha.querySelector(".btn-remover");
        btnRemover.addEventListener("click", () => removerProduto(produto));

        tabelaBody.appendChild(linha);
    });
}

function atualizarInterface() {
    const produtosVisiveis = obterProdutosFiltrados();
    renderizarTabela(produtosVisiveis);
    atualizarTotalEstoque(produtosVisiveis);
}

//
// FASE 6: Inicialização
//
carregarDoLocalStorage();
atualizarInterface();