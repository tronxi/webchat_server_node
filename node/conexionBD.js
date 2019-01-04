var mysql=require('mysql');

var conexion=mysql.createConnection({
    host:'192.168.0.5',
    port:'3306',
    user:'tronxi',
    password:'tronxi97',
    database:'chat'
});

conexion.connect(function (error){
    if (error)
        console.log('Problemas de conexion con mysql');
    else
        console.log('se inicio conexion');
});


module.exports=conexion;