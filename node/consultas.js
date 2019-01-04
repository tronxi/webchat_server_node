var bd = require('./conexionBD');
var sha1 = require('sha1');

exports.login = function (cb, usuario, pass) {
    let resultado = "";
    let qr = "select nombre, contra from usuario where nombre = '" + usuario + "'";
    bd.query(qr, function (error, filas) {
        if (error) {
            console.log('error en el login');
            return;
        }
        if (filas.length == 0) {
            resultado = "noExiste";
        }
        else if (filas[0].contra == sha1(pass)) {
            resultado = "ok";
        }
        else {
            resultado = "passIncorrecta";
        }
        cb(error, resultado);
    });
}

exports.registro = function (cb, usuario, pass) 
{
    let resultado = "";
    let qr = "select nombre, contra from usuario where nombre = '" +
        usuario + "'";
    bd.query(qr, function (error, filas) 
    {
        if (error) 
        {
            console.log('error al comprobar si existe usuario');
            return;
        }
        if (filas.length > 0) 
        {
            resultado = "existe";
            cb(error, resultado);
        }
        else 
        {
            if (resultado != "existe") 
            {
                qr = "insert into usuario (nombre, contra) values ('" +
                    usuario + "','" + sha1(pass) + "')";
                bd.query(qr, function (error, filas) 
                {
                    if (error) 
                    {
                        console.log('error al introducir nuevo usuario');
                        return;
                    }
                    else 
                    {
                        resultado = "ok";
                    }
                });
            }
            console.log(resultado);
            cb(error, resultado);
        }
    });

}
