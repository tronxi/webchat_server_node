var bd=require('./conexionBD');

exports.login = function(cb, usuario, pass)
{
    let qr = "select nombre, contra from usuario where nombre = '" + usuario + "'";
    bd.query(qr, function(error, filas)
    {
        if(error)
        {
            console.log('error en el login');
            return;
        }
        console.log(filas[0].contra);
        console.log(filas);
        cb(error, filas);
    });
}
