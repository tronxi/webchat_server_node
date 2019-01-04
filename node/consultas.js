var bd=require('./conexionBD');

exports.login = function(cb, usuario, pass)
{
    let resultado = "";
    let qr = "select nombre, contra from usuario where nombre = '" + usuario + "'";
    bd.query(qr, function(error, filas)
    {
        if(error)
        {
            console.log('error en el login');
            return;
        }
        if(filas.length == 0)
        {
            resultado = "noExiste";
        }
        else if(filas[0].contra == pass)
        {
            resultado = "ok";
        }
        else
        {
            resultado = "passIncorrecta";
        }
        cb(error, resultado);
    });
}
