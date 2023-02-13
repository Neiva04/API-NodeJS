const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const Usuario = mongoose.model("usuarios")
const bcrypt = require('bcryptjs')

require('../models/Usuario')

module.exports = function(passport){

    passport.use(new localStrategy({usernameField: 'login', passwordField: 'senha'}, (login, senha, done)=>{
        Usuario.findOne({login: login}).then((usuario) => {
            bcrypt.compare(senha, usuario.senha, (err, sucesso)=>{
                if(sucesso){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'erro '+err})
                }
            })
        }).catch((err) => {
            return done(null, false, {message: 'essa conta não existe '+err})
        });
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario._id)
    })

    passport.deserializeUser(function(_id, done) {
        Usuario.findById(_id,(err, usuario)=>{
            done(err, usuario);
        })  
        })
}