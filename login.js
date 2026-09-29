const supabaseUrl = "https://rtkkihjboixxhvfyzvlv.supabase.co";

const supabaseKey = "sb_publishable_YxhKOFCr-M59-Xr4wQqN5A_f-U91ekT";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

const formulario = document.getElementById("formLogin");
const mensagemErro = document.getElementById("mensagemErro");

formulario.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: senha
    });

    if (error) {

        console.error("Erro no login:", error);

        mensagemErro.textContent =
            "E-mail ou senha incorretos.";

        mensagemErro.classList.remove("d-none");

        return;
    }

    window.location.href = "index.html";
});