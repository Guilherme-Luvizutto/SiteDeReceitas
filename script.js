const formulario = document.getElementById("formReceita");
let receitas = [];
let receitaEditandoId = null;

formulario.addEventListener("submit", async function(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const ingredientes = document.getElementById("ingredientes").value;
    const modoPreparo = document.getElementById("modoPreparo").value;
    const tempoPreparo = Number(document.getElementById("tempoPreparo").value);
    const rendimento = Number(document.getElementById("rendimento").value);
    const categoria = document.getElementById("categoria").value;

    let error;

    if (receitaEditandoId === null) {

        const resultado = await supabaseClient
            .from("receitas")
            .insert([
                {
                    nome: nome,
                    ingredientes: ingredientes,
                    modo_preparo: modoPreparo,
                    tempo_preparo: tempoPreparo,
                    rendimento: rendimento,
                    categoria: categoria
                }
            ]);

        error = resultado.error;

    } else {

        const resultado = await supabaseClient
            .from("receitas")
            .update({
                nome: nome,
                ingredientes: ingredientes,
                modo_preparo: modoPreparo,
                tempo_preparo: tempoPreparo,
                rendimento: rendimento,
                categoria: categoria
            })
            .eq("id", receitaEditandoId);

        error = resultado.error;
    }

    if (error) {
        console.error("Erro:", error);
        alert("Erro ao salvar receita.");
        return;
    }

    mostrarToast(
        receitaEditandoId === null
            ? "Receita cadastrada com sucesso!"
            : "Receita atualizada com sucesso!"
    );

    formulario.reset();
    receitaEditandoId = null;

    document.querySelector("#formReceita button[type='submit']").textContent =
        "Cadastrar receita";

    carregarReceitas();
});

async function carregarReceitas() {
    const { data, error } = await supabaseClient
        .from("receitas")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error("Erro ao carregar receitas:", error);
        return;
    }

    receitas = data;

    document.getElementById("totalReceitas").textContent = receitas.length;

    mostrarReceitas(receitas);
}

function mostrarReceitas(lista) {
    const listaReceitas = document.getElementById("listaReceitas");

    listaReceitas.innerHTML = "";

    if (lista.length === 0) {
        listaReceitas.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    Nenhuma receita encontrada.
                </div>
            </div>
        `;

        return;
    }

    lista.forEach(function(receita) {
        listaReceitas.innerHTML += `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-body">

                        <h3 class="card-title">
                            ${receita.nome}
                        </h3>

                        <p>
                            <strong>Categoria:</strong>
                            ${receita.categoria}
                        </p>

                        <p>
                            <strong>Tempo:</strong>
                            ${receita.tempo_preparo} minutos
                        </p>

                        <p>
                            <strong>Rendimento:</strong>
                            ${receita.rendimento}
                        </p>

                        <div class="d-flex gap-2 flex-wrap">

                            <button 
                                class="btn btn-outline-danger"
                                onclick="alternarFavorito(${receita.id})">
                                ${receita.favorito ? "❤️ Favoritado" : "🤍 Favoritar"}
                            </button>

                            <button 
                                class="btn btn-primary"
                                onclick="verReceita(${receita.id})">
                                Ver receita
                            </button>

                            <button 
                                class="btn btn-warning"
                                onclick="editarReceita(${receita.id})">
                                Editar
                            </button>

                            <button 
                                class="btn btn-danger"
                                onclick="excluirReceita(${receita.id})">
                                Excluir
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        `;
    });
}

async function excluirReceita(id) {
    const confirmar = confirm("Tem certeza que deseja excluir esta receita?");

    if (!confirmar) {
        return;
    }

    const { error } = await supabaseClient
        .from("receitas")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir receita.");
        return;
    }

    mostrarToast("Receita excluída com sucesso!");

    carregarReceitas();
}

function editarReceita(id) {
    const receita = receitas.find(function(item) {
        return item.id === id;
    });

    if (!receita) {
        return;
    }

    document.getElementById("nome").value = receita.nome;
    document.getElementById("ingredientes").value = receita.ingredientes;
    document.getElementById("modoPreparo").value = receita.modo_preparo;
    document.getElementById("tempoPreparo").value = receita.tempo_preparo;
    document.getElementById("rendimento").value = receita.rendimento;
    document.getElementById("categoria").value = receita.categoria;

    receitaEditandoId = id;

    document.querySelector("#formReceita button[type='submit']").textContent =
        "Salvar alterações";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

const campoPesquisa = document.getElementById("campoPesquisa");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroFavorito = document.getElementById("filtroFavorito");

function filtrarReceitas() {

    const pesquisa =
        campoPesquisa.value.trim().toLowerCase();

    const categoriaSelecionada =
        filtroCategoria.value;

    const favoritoSelecionado =
        filtroFavorito.value;

    const receitasFiltradas =
        receitas.filter(function(receita) {

            const nome =
                receita.nome.toLowerCase();

            const correspondeNome =
                nome.includes(pesquisa);

            const correspondeCategoria =
                categoriaSelecionada === "Todas" ||
                receita.categoria === categoriaSelecionada;

            const correspondeFavorito =
                favoritoSelecionado === "Todas" ||
                (favoritoSelecionado === "Favoritas" &&
                    receita.favorito === true) ||
                (favoritoSelecionado === "NaoFavoritas" &&
                    receita.favorito === false);

            return (
                correspondeNome &&
                correspondeCategoria &&
                correspondeFavorito
            );
        });

    mostrarReceitas(receitasFiltradas);
}
 
campoPesquisa.addEventListener("input", filtrarReceitas);

filtroCategoria.addEventListener("change", filtrarReceitas);

filtroFavorito.addEventListener("change", filtrarReceitas); 


function verReceita(id) {

    const receita = receitas.find(function(item) {
        return item.id === id;
    });

    if (!receita) {
        return;
    }

    document.getElementById("modalTitulo").textContent = receita.nome;

    document.getElementById("modalCategoria").textContent =
        receita.categoria;

    document.getElementById("modalIngredientes").textContent =
        receita.ingredientes;

    document.getElementById("modalModoPreparo").textContent =
        receita.modo_preparo;

    document.getElementById("modalTempo").textContent =
        receita.tempo_preparo;

    document.getElementById("modalRendimento").textContent =
        receita.rendimento;

    const modal = new bootstrap.Modal(
        document.getElementById("modalReceita")
    );

    modal.show();
}

async function alternarFavorito(id) {

    const receita = receitas.find(function(item) {
        return item.id === id;
    });

    if (!receita) {
        return;
    }

    const novoFavorito = !receita.favorito;

    const { error } = await supabaseClient
        .from("receitas")
        .update({
            favorito: novoFavorito
        })
        .eq("id", id);

    if (error) {
        console.error("Erro ao alterar favorito:", error);
        alert("Erro ao alterar favorito.");
        return;
    }

    receita.favorito = novoFavorito;

    filtrarReceitas();
}

function mostrarToast(mensagem) {
    const toastElement = document.getElementById("toastReceita");
    const mensagemElement = document.getElementById("mensagemToast");

    mensagemElement.textContent = mensagem;

    const toast = new bootstrap.Toast(toastElement);

    toast.show();
}

carregarReceitas();