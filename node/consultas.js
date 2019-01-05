var bd = require('./conexionBD');
var sha1 = require('sha1');
var crypto = require('crypto');

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

exports.registro = function (cb, usuario, pass) {
    let resultado = "";
    let qr = "select nombre, contra from usuario where nombre = '" +
        usuario + "'";
    bd.query(qr, function (error, filas) {
        if (error) {
            console.log('error al comprobar si existe usuario');
            return;
        }
        if (filas.length > 0) {
            resultado = "existe";
            cb(error, resultado);
        }
        else {
            if (resultado != "existe") {
                qr = "insert into usuario (nombre, contra) values ('" +
                    usuario + "','" + sha1(pass) + "')";
                bd.query(qr, function (error, filas) {
                    if (error) {
                        console.log('error al introducir nuevo usuario');
                        return;
                    }
                    else {
                        resultado = "ok";
                        cb(error, resultado);
                    }
                });
            }
        }
    });
}

    exports.conversacionUsuario = function (cb, usuario) 
    {
        let qr = "SELECT DISTINCT \
        c.nombre, c.id_conversacion, MAX(fecha) as ultimaFecha, estado \
        FROM \
        conversacion c \
        INNER JOIN \
        mensaje m ON c.id_conversacion = m.id_conversacion \
        WHERE \
        c.id_conversacion != 0 \
        AND c.nombre != '"+ usuario +"' \
        AND c.id_conversacion IN(SELECT \
            c.id_conversacion \
        FROM \
            conversacion c \
        WHERE \
            c.nombre = '"+ usuario +"') \
        GROUP BY c.id_conversacion \
        ORDER BY ultimaFecha DESC; "; 
        bd.query(qr, function (error, filas) 
        {
            if (error) 
            {
                console.log('error al buscar conversaciones');
                return;
            }
            cb(error, filas);
        });
    }

    exports.personas = function (cb, usuario)
    {
        let qr = "select nombre from usuario where nombre !='" + usuario + "'"; 
        bd.query(qr, function (error, filas) 
        {
            if (error) 
            {
                console.log('error al buscar personas');
                return;
            }
            cb(error, filas);
        });
    }

    exports.crearConversacion = function (cb, usuario, persona)
    {
        let qr = "SELECT DISTINCT \
        c.nombre, c.id_conversacion as id \
    FROM \
        conversacion c \
    WHERE \
        c.id_conversacion != 0 \
            AND c.nombre != '" + usuario + "' \
            AND c.id_conversacion IN (SELECT \
                c.id_conversacion \
            FROM \
                conversacion c \
            WHERE \
                c.nombre = '" + usuario + "');";
        bd.query(qr, function(error, filas)
        {
            if(error)
            {
                console.log('error al buscar conversaciones');
                return;
            }
            let existe = false;
            for(let i = 0; i < filas.length; i++)
            {
                if(filas[i].nombre == persona)
                {
                    existe = filas[i].id;
                }
            }
            if(existe != false)
            {
                cb(error, existe);
            }
            else if(!existe)
            {
                let qr2 = "SELECT MAX(id_conversacion) as id FROM conversacion;";

                bd.query(qr2, function(error, filas)
                {
                    if(error)
                    {
                        console.log('error al buscar maximo id')
                        return;
                    }
                    let id = parseInt(filas[0].id) + 1;

                    let qr3 = "insert into conversacion values('" + usuario + "', " + id + ", 0);";
                    bd.query(qr3, function(error, filas)
                    {
                        if(error)
                        {
                            console.log('error al insertar usuario');
                            return;
                        }
                        let qr4 = "insert into conversacion values('" + persona + "', " + id + ", 0);";
                        bd.query(qr4, function(error, filas)
                        {
                            if(error)
                            {
                                console.log('error al insertar persona');
                                return;
                            }
                            cb(error, id);
                        });
                    });
                });
            }

        });
    }

    exports.mostrarMensaje = function(cb, usuario, id)
    {
        let qr = "select nombre, texto, fecha from mensaje where id_conversacion = " +  id + "";
        let mensajes;
        bd.query(qr, function(error, filas)
        {
            if(error)
            {
                console.log('error al seleccionar mensajes');
                return;
            }
            mensajes = filas;

            let qr2 = "UPDATE conversacion \
			SET \
				estado = 0 \
			WHERE \
				id_conversacion = " + id + " \
					AND nombre = (SELECT \
						nombre \
					WHERE \
						id_conversacion = " + id + " \
                            AND nombre != '" +  usuario + "');";
            bd.query(qr2, function(error, filas)
            {
                if(error)
                {
                    console.log('error al poner estado a 0');
                    return;
                }
                for(let i = 0; i < mensajes.length; i++)
                {
                    mensajes[i].texto = decrypt_token(mensajes[i].texto);
                }
                cb(error, mensajes);
            });

        });
    }

    function decrypt_token(data) 
    {
        console.log(data);
        key = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
        iv = 'AAAAAAAAAAAAAAAA';
        const algorithm = 'aes-192-cbc';

        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setEncoding('base64');
        let decrypted = decipher.update(data, 'base64', 'utf8');
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
        //return "hola";
      }
