const e = require("express")

const formlogin = document.getElementById("formlogin")
formlogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value
    try{
        const resposta = await fetch("/api/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify( {email, senha})
        })
        const resultado = await resposta.json();
        if(!resposta.ok){
             throw new Error(resultado.erro)
        }
        window.location.href ="dashboard.html"
    } catch (erro) {
        alert("ERRO!", erro)
    }
})