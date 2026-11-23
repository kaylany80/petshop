require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
app.use(express.json());
 
app.use(express.static(path.join(__dirname, "public")))
app.use(cookieParser());

 
const db = mysql.createPool({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    database: process.env.DB_NAME
})

async function iniciar( ) {
    try {
        const [usuario] = await db.execute ("SELECT id FROM usuario WHERE email = ?", [process.env.ADMIN_EMAIL])
        if (usuario.length === 0 ) {
            const senhaHash = await bcrypt.hash(process.env.ADMIN_SENHA, 10)
            await db.execute("INSERT INTO usuario (email, senha) VALUES (?,?) ", [process.env.ADMIN_EMAIL, senhaHash]);
            console.log("Admin criado")
        }
    } catch (erro) {
        console.log("Nao foi possivel conectar com o banco de dados")
    }
}

app.post("/api/atendimento", async(req,res) => {
    try {
        const {tutor, pet, especie, servico, valor, data} = req.body;
        if (!tutor || !pet || !especie || !servico || !Number(valor) || !data) {
            return res.status(400).json({erro: "Confira todos os campos"})
        }
        if (valor <=0 ) {
            return res.status(400).json ({erro: 'valor deve ser maior que 0.'})
        }
        const [resultado]  = await db.execute(
            `INSERT INTO atendimento (tutor, pet, especie, servico, valor, data_atendimento) VALUES (?,?,?,?,?,?)`, [tutor.trim(), pet.trim(), especie, servico, Number(valor), data]
        )
        res.status(201).json({mensagem: "Atendimento salvo!", id: resultado.insertId})
    } catch (erro) {
        console.log(erro)
        res.status(500).json({erro: "erro de conexão com o banco"})
    }
})
 app.post ("/api/login", async (req,res) => {
    try{
        const {email, senha} = req.body;
        if(!email|| !senha){
            return res.status(400).json({erro:"informe e-mail  e senha"})
        }
        const [usuario] = await db.execute ("SELECT id, email,senha FROM usuarios WHERE email = ?", [email.trim()]);
        if(usuario.length === 0 ) {
            return res.status(401).json({erro: "credenciais incorretas"})
        }
        const dados = usuario [0]
        const senhaCorreta = await bcrypt.compare(senha,dados.senha)
        if(!senhaCorreta) {
            return res.status(401).json({erro: "credencias invalidas"})       
         }
         const token = jwt.sing(
            {id: dados.id, email: dados.email},
            process.env.JWT.SEGREDO,
            {expuresIn:"1h"}
         )
         res.cookie("token", token, {
            httpOnly: true,
            secure:process.env.NODE === "production",
            semeSite: "strict",
            maxAge:60*60*1000
         })
        res.json({mensagem:" login realizado"})
    } catch (erro){
           res.status(500).json({erro: "|erro de conexão com banco de dados"})
    }
 })


app.listen(3000, () => {
    console.log("Servidor rodando em localhost:3000")
})