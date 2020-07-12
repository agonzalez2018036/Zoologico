'use strict'

var User = require('../models/user.model');
//Bcrypt encriptar contraseñas
var bcrypt = require('bcrypt-nodejs');
//jwt
var jwt = require('../services/jwt');
// Administracion de archivos en el servidor
var fs = require('fs');
//Manejo de rutas en el servidor (Buscar en rutas fisico)
var Path = require('path');

function saveUser(req,res){
    var user = new  User();
    var params = req.body;

    if(params.name && params.username && params.email && params.password){
        User.findOne({$or:[{username : params.username}, {email : params.email}]}, (err,us)=>{
            if (err){
                res.status(500).send({ message : 'Error general, intentelo más tarde'});
            } else if (us){
                res.send({ message : 'Usuario o correo ya utilizados'});
            } else {
                user.name = params.name;
                user.username = params.username;
                user.email = params.email;
                user.role = 'USER';

                bcrypt.hash(params.password, null ,null, (err, passwordHash)=>{
                    if(err){
                        res.status(500).send('Error al encriptar contraseña');
                    } else if (passwordHash){
                        user.password = passwordHash;
                        
                        user.save((err,userSaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general'});
                            } else if (userSaved) {
                                res.send({message: 'Usuario creado', user: userSaved});
                            } else {
                                res.status(404).send({ message: 'Usuario no guardado'});
                            }
                        });
                    } else {
                        res.status(418).send({ message : 'Error inesperado'});
                    }
                })      
            }
        });
    } else {
        res.status({message : 'Ingresa todos los datos'});
    }
}

function login(req,res){
    var params = req.body;
    
    if(params.username || params.email){
        if(params.password){
            User.findOne({$or:[{username: params.username}, { email : params.email}]}, (err,check)=>{
                if(err){
                    res.status(500).send({ message : 'Error general'});
                } else if (check){
                    bcrypt.compare(params.password, check.password, (err,passwordOk)=>{
                        if(err){
                            res.status(500).sned({ message : 'Error al comparar'});
                        } else if (passwordOk){
                            if(params.gettoken = true){
                                res.send({token: jwt.createToken(check)});
                            } else {
                                res.send({ message : 'Bienvenido', user: check});
                            }
                        } else {
                            res.send({message:'Contraseña incorrecta'});
                        } 
                    });
                } else {

                }
            });
        } else {
            res.send({message: 'Ingrese la contraseña'});
        }
    } else {
        res.send({ message: 'Ingresa tu correo o tu username'});
    }
}

function pruebaMiddlaware(req, res){
    res.send({message: 'Prueba correcta'})
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de permisos para entrar'})
    }else{
        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
            if(err){
                res.status(500).send({message: ' Error general '})
            }else if(userUpdated){
                res.send({message: userUpdated})
            }else{
                res.status(404).send({message: 'No se ha podido actualizar'})
            }
        })
    }
}

function uploadImage (req, res){
    var userId = req.params.id;
    var fileName = 'No subido';

    if(userId != req.user.sub){
        res.status(403).send({message: 'Error de autorizacion'})
    }else{
        if(req.files){
            var filePath = req.files.image.path;
            var fileSplit = filePath.split('\\');
            var fileName = fileSplit[2];

            
            var ext = fileName.split('\.');
            var fileExt = ext[1];
            
            if(fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg'){
                User.findOneAndUpdate(userId, {image: fileName}, {new: true}, (err, userUpdated)=>{
                    if(err){
                        res.status(500),send({message: 'Eror general'})
                    }else if(userUpdated){
                        res.send({user: userUpdated, image: userUpdated.image})
                    }else{
                        res.status(418).send({message: 'no HA SIDO ACTUALIZADO'})
                    }
                })
            }else{
                fs.unlink(filePath, (err)=>{
                    if(err){
                        res.status(418).send({message: 'Extension de archivo no admitida y archivo no eliminado'});
                    }else{
                        res.status(418).send({message: 'Archivo eliminado, extension de archivo no admitida'})
                    }
                })
                
            }

        }else{
            res.status(404).send({message: 'No se ha subico ningun archivo'})
        }
    }
}

function getImage(req,res){
    var userId = req.params.id;
    var fileName = req.params.image;
    var pathFile = './upLoads/users/' + fileName;

    fs.exists(pathFile, (exist)=>{
        if(exist){
            res.sendFile(Path.resolve(pathFile))
        }else{
            res.status(404).send({message: 'imagen inexistene'})
        }
    })
}

function listUsers(req,res){
    User.find({}, (err, users)=>{
        if(err){
            res.status(500).send({message: 'Error general en la busqueda'})
        }else if(users){
            res.send({user: users})
        }else{
            res.status(418).send({message: 'Error general en la busqueda'})
        }
    })
}

module.exports = {
    saveUser,
    login,
    pruebaMiddlaware,
    updateUser,
    uploadImage,
    getImage,
    listUsers
}