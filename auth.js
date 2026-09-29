const supabaseUrl = "https://rtkkihjboixxhvfyzvlv.supabase.co";
const supabaseKey = "sb_publishable_YxhKOFCr-M59-Xr4wQqN5A_f-U91ekT";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);

async function verificarLogin() {

    const { data: { session } } =
        await supabaseClient.auth.getSession();

    if (!session) {
        window.location.replace("login.html");
        return;
    }

    document.body.style.display = "block";
}

verificarLogin();

document.getElementById("btnSair").addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error);
        return;
    }

    window.location.replace("login.html");
});