'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'clave_super_secreta_12345';
exports.createToken = (user)=>{

    // Datos por medio de los cuales se va a crear el token, bajo que datos
    var payload = {
        sub: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        iat: moment().unix(),
        exp: moment().add(15, "days").unix()
    }
    return jwt.encode(payload,key);
}