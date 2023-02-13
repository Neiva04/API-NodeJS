const express = require('express');
const router = express.Router()
const mongoose = require("mongoose")
    require("../models/Usuario")
    const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs')
const passport = require('passport');
const {isAdmin} = require('../helpers/isAdmin')

router.get('/registro', (req, res)=>{
    res.render('usuario/registro')
})
router.get('/login', (req, res)=>{
    res.render('usuario/login')
})
router.post('/login', (req, res, next)=>{

    if(isAdmin == 1){
        passport.authenticate('local', {
            successRedirect: '/admin/',
            failureRedirect: '/usuario/registro',
            failureFlash: true,
        })(req, res, next)
    }else{
        console.log('aaaaaaaa');
        passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/usuario/registro',
            failureFlash: true,
        })(req, res, next)
    }
   
    
})

router.post('/registro/novo', function(req, res){
    
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome invalido"})
    }
    if(!req.body.login || req.body.login == undefined || req.body.login == null){
        erros.push({texto: "login invalido"})
    }

        Usuario.findOne({login: req.body.login}).then((login) => {
            if(login.login == req.body.login){
                console.log('debug 2');
                erros.push({texto: "login ja existe"})
            }
        
    
    if(!req.body.email || req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email invalido"})
    }
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha invalido"})
    }
    if(!req.body.csenha || req.body.csenha == undefined || req.body.csenha == null){
        erros.push({texto: "por favor confirmar senha"})
    } 
    if(req.body.csenha != req.body.senha){
        erros.push({texto: "senha tem que ser igual"})
    }
    if(erros.length > 0){
        console.log(erros.length);
        console.log('debug 3');
        res.render('usuario/registro', {erros: erros})
    }else{
        const novoUsuario= {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            login: req.body.login
            
        }
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                if(err){
                    req.flash("error_msg", "Erro! :´)")
            res.redirect("/") 
                }

                novoUsuario.senha = hash
                new Usuario(novoUsuario).save().then(() => {
                    req.flash("success_msg", "Usuario Cadastrado com Suceesso")
                    res.redirect('/')
                }).catch((err) => {
                    req.flash("error_msg", "Erro no Cadastro do Usuario")
                    res.redirect("/")
                });
            })
        })

    }
}).catch((err) => {
    
    if(!req.body.email || req.body.email == undefined || req.body.email == null){
        erros.push({texto: "email invalido"})
    }
    if(!req.body.senha || req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "senha invalido"})
    }
    if(!req.body.csenha || req.body.csenha == undefined || req.body.csenha == null){
        erros.push({texto: "por favor confirmar senha"})
    } 
    if(req.body.csenha != req.body.senha){
        erros.push({texto: "senha tem que ser igual"})
    }
    if(erros.length > 0){
        console.log(erros.length);
        console.log('debug 3');
        res.render('usuario/registro', {erros: erros})
    }else{
        const novoUsuario= {
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            login: req.body.login,
            
        }
        
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(novoUsuario.senha, salt, (err, hash)=>{
                if(err){
                    req.flash("error_msg", "Erro! :´)\n" + err)
            res.redirect("/") 
                }

                novoUsuario.senha = hash
                new Usuario(novoUsuario).save().then(() => {
                    req.flash("success_msg", "Usuario Cadastrado com Suceesso")
                    res.redirect('/')
                }).catch((err) => {
                    req.flash("error_msg", "Erro no Cadastro do Usuario")
                    res.redirect("/")
                });
            })
        })

    }
});
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        req.flash('success_msg', "Logout com sucesso!")
        res.redirect("/")
    })
})


module.exports = router 