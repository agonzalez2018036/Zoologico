'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/ZooV2AM', {useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log('Conexión a la DB correcta');
    app.listen(port , ()=>{
        console.log('Servidor de express corriendo', port);
    });
}).catch(err=>{
    console.log('Error al conectarse' ,err);
})
