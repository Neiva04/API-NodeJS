//MODULOS
    const express = require('express');//framework
    const app = express();
    const handlebars = require('express-handlebars');//Templetes de cada rota
        //Rotas
            const admin = require('./rotas/admin')
            const usuario = require('./rotas/usuario')
    const path = require('path');//união do endereço
    const { default: mongoose } = require('mongoose');//banco de dados MongoDB
    const session = require("express-session")//Sessão de cada usuário na api
    const flash = require("connect-flash");//Usado para mensagens flash 
    const passport = require('passport');//Usado para autenticação
    require('./config/auth')(passport)//Rota da autenticação
        //Objetos do Banco de dados
            //Models da criação das Colections
                require('./models/Postagens')
                require('./models/Categoria')
            const Postagens = mongoose.model('postagens')
            const Categorias = mongoose.model('categorias')


//CONFIG.
    //SESSÃO
        app.use(session({
            secret: "rfcn",
            resave: true,
            saveUninitialized:true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    app.use(express.urlencoded({extended: false}))
    app.use(express.json())
    //MIDDLEWARE 
        app.use((req, res, next)=>{
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash('error')
            res.locals.user = req.user || null
            next()
        })
    //HANDLEBARS 
        app.engine('handlebars', handlebars.engine({defaultLayouts: 'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,}}))
        app.set('view engine', 'handlebars')//nosso engine de integração 
    //MONGOOSE
        mongoose.set('strictQuery', true);
        mongoose.connect('mongodb://127.0.0.1/bancoblog').then(() => {
            console.log("Sucesso ao Conectar com o Banco de Dados");
        }).catch((err) => {
            console.log('Erro ao Conectar com o Banco de Dados\n'+err);
        });
    //PUBLIC 
        app.use(express.static(path.join(__dirname,'public')))
    //ROTAS
        app.get('/', (req, res)=>{//ROTA PRINCIPAL
            Postagens.find().populate('categoria').sort({date: 'desc'}).then((postagens)=>{
                res.render('index', {postagens: postagens})
            }).catch((err)=>{
                flash('error_msg', 'Erro ao Carregar Postagens\n'+ err)
                res.redirect('/Error')
            }) 
        })

        app.get('/postagem/:slug',(req,res)=>{//ROTA QUE IRA ABRIR 1 POSTAGEM ESPECIFICA
            Postagens.find({slug: req.params.slug}).then((postagem) => {
                res.render('postagem/index', {postagem: postagem})
            }).catch((err) => {
                flash('error_msg', 'Erro ao Carregar Postagem\n'+ err)
            });
        })

        app.get('/categorias', function(req, res){//ROTA DA LISTA DAS CATEGORIAS
            Categorias.find().then((categorias) => {
                res.render('categorias', {categorias: categorias})
            }).catch((err) => {
                flash('error_msg', 'Erro ao Carregar Categorias\n'+ err)
            });
        })    

        app.get('/postagens/:slug',(req,res)=>{//ROTA DAS POSTAGENS DE CERTA CATEGORIA
         
            Categorias.findOne({slug: req.params.slug}).then((categoria) => {
                if (categoria) {
                    Postagens.find({categoria: categoria._id}).then((postagens) => {
                        res.render('postagem/indexcategorias', {postagens: postagens, categoria: categoria})
                    }).catch((err) => {
                        flash('error_msg', 'Erro ao Carregar as Postagens\n'+ err)
                        res.redirect('/')
                    });
                }else{ 
                    flash('error_msg', 'Erro ao Carregar a Categoria\n'+ err)
                    res.redirect('/')
                }
            }).catch((err) => {
                flash('error_msg', 'Erro ao Carregar as Categorias\n'+ err)
            });
        })

        app.get('/error', (req, res)=>{//ROTA CASO AJA ERRO AO CARREGAR AS POSTAGENS NA PÁGINA PRINCIPAL
            res.render('error')
        }) 
        
    //ROTAS NOS MODULOS
        app.use('/admin', admin)
        app.use('/usuario', usuario)
    
    //OUTROS
        const port = process.env.PORT || 9091;/*HEROKU IRÁ GERAR O PORT, MAS CASO A APLICAÇÃO SEJA EXECUTADA 
        LOCALMENTE USAR O PORT PRE DETERMINADO */   
        app.listen(port, () =>{ 
            console.log('Servidor Online! \nhttp//localhost:'+port+'/');
        });