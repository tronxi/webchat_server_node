var mysql=require('mysql');
var datos = require('./datos');
var conexion=mysql.createConnection({
    host: datos.host,
    port: datos.port,
    user: datos.user,
    password: datos.password,
    database: datos.database
});

conexion.connect(function (error){
    if (error)
        console.log('Problemas de conexion con mysql');
    else
        console.log('se inicio conexion');
});


module.exports=conexion;