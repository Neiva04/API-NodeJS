//MODULOS
    const express = require('express');
    const router = express.Router()
    const mongoose = require("mongoose")
    //Objetos do Banco de dados
        //Models da criação das Colections
            require("../models/Categoria")
            require("../models/Postagens")
        const Categoria = mongoose.model("categorias")
        const Postagem = mongoose.model("postagens") 
    const {isAdmin} = require('../helpers/isAdmin')//Modulo de verificação para o acesso às paginas Admin

router.get('/', isAdmin, function(req, res){//Pagina Principal do Admin
    res.render('index')
})

router.get('/categorias', isAdmin, function(req, res){
    Categoria.find()/*.sort({date: 'desc'}) */.then((categorias)=>{
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', 'Erro ao Carregar as Categorias\n'+ err);
    })
})

router.get('/categorias/add', isAdmin, function(req, res){
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', isAdmin, function(req, res){
    
    var erros = []

    if(!req.body.nome || req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "nome invalido"})
    }
    if(!req.body.slug || req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "slug invalido"})
    }
    if(erros.length > 0){
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria= {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria Criada com Suceesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Erro na Criação da Categoria")
            res.redirect("/admin")
        });
    }
})

router.get('/categorias/edit/:id', isAdmin, function(req, res){ 
    Categoria.findOne({_id: req.params.id}).then((categoria)=>{
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err)=>{
        req.flash('error_msg', 'Erro na edição da categoria\n'+err)
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', isAdmin, (req, res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        categoria.date = Date.now()

        categoria.save().then(() => {
            req.flash('success_msg', 'Categoria Editada com Sucesso')
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao salvar categoria\n'+err)
            res.redirect('/admin/categorias')
        });
    }).catch((err) => {
        req.flash('error_msg', 'Erro na edição da categoria\n'+err)
        res.redirect('/admin/categorias') 
    });
})

router.post('/categorias/delete', isAdmin, (req, res)=>{
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria Deletado com Sucesso")
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao Deletar a Categoria\n"+err)
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', isAdmin, (req, res)=>{
    Postagem.find().populate("categoria").then((postagens)=>{
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao Carregar Postagens\n"+err)
        res.redirect('/admin')
    })
})
 
router.get('/postagens/add', isAdmin, function(req, res){
    Categoria.find().then((categorias)=>{
        res.render('admin/addpostagens', {categorias: categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao Carregar Categorias\n"+err)
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', isAdmin, function(req, res){
    
    var erros = []

    if(!req.body.titulo || req.body.titulo == undefined || req.body.titulo == null){
        erros.push({texto: "Titulo Invalido"})
    }
    if(!req.body.slug || req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug Invalido"})
    }
    if(!req.body.descricao || req.body.descricao == undefined || req.body.descricao == null){
        erros.push({texto: "Descrição Invalido"})
    }
    if(!req.body.conteudo || req.body.conteudo == undefined || req.body.conteudo == null){
        erros.push({texto: "Conteúdo Invalido"})
    }
    
    if(erros.length > 0){
        res.render('admin/addpostagens', {erros: erros})
    }else{
        const novaPostagem= {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
    
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem Criada com Suceesso")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash("error_msg", "Erro na Criação da Postagem\n"+err)
            res.redirect("/admin")
        });
    }
})

router.get('/postagens/edit/:id', isAdmin, function(req, res){ 
    Postagem.findOne({_id: req.params.id}).then((postagem)=>{
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            req.flash('error_msg', 'Erro no Carregamento das Categorias\n'+err)
            res.redirect('/admin/postagens')
        });
    }).catch((err)=>{
        req.flash('error_msg', 'Erro na edição da postagem\n'+err)
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', isAdmin, (req, res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        postagem.date = Date.now()

        postagem.save().then(() => {
            req.flash('success_msg', 'Postagem Editada com Sucesso')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao Salvar Postagem\n'+err)
            res.redirect('/admin/postagens')
        });
    }).catch((err) => {
        req.flash('error_msg', 'Erro na Edição da Postagem\n'+err)
        res.redirect('/admin/postagens') 
    });
})

router.post('/postagens/delete', isAdmin, (req, res)=>{
    Postagem.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem Deletado com Sucesso")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao Deletar a Postagem\n"+err)
        res.redirect('/admin/postegens')
    })
})

module.exports = router 