'use strict'

var express = require('express');
var connectMultiparty = require('connect-multiparty')// manejo de archivos multimedia
var mdUpload = connectMultiparty({uploadDir: './upLoads/users'});
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated')

var api = express.Router();

api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);
//autenticacion
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser)
api.get('/preubaMiddleware', mdAuth.ensureAuth, userController.pruebaMiddlaware)
//imagen
api.put('/uploadImage/:id', [mdAuth.ensureAuth, mdUpload], userController.uploadImage)
api.get('/getImage/:id/:image', [mdAuth.ensureAuth, mdUpload], userController.getImage);
api.get('/listUsers', mdAuth.ensureAuthAdmin, userController.listUsers)

module.exports = api;