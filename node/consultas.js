var bd = require('./conexionBD');
var sha1 = require('sha1');
var FCM = require('fcm-node');

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
        let clave = "53c42b89fa7bb4d07fd7a4002bcc678e2de3250";
        let qr = "select nombre,  AES_DECRYPT(texto, '"+ clave+ "') as texto2, fecha from mensaje where id_conversacion = " +  id + "";
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
                    mensajes[i].texto2 =
                    String.fromCharCode.apply(null, new Uint16Array(mensajes[i].texto2));
                }
                cb(error, mensajes);
            });

        });
    }

    exports.enviarMensaje = function(cb, mensaje, usuario, id)
    {
        let key = "53c42b89fa7bb4d07fd7a4002bcc678e2de3250";
        let d = new Date();
        let fecha = "" + d.getFullYear() + "/" + d.getMonth() + 
        "/" + d.getDate() + " " + d.getHours() + ":" +
        d.getMinutes() + ":" + d.getSeconds();
        let qr = "insert into mensaje (nombre, texto, fecha, id_conversacion) \
         values ('" + usuario + "',\
          AES_ENCRYPT('" + mensaje + "', '" +  key + "') , \
         '" + fecha + "', " + id + ")";

         bd.query(qr, function(error, filas){
             if(error)
             {
                 console.log('error al enviar mensaje');
                 return;
             }
             let qr2 = "UPDATE conversacion \
                SET \
                    estado = estado + 1 \
                WHERE \
                    id_conversacion = " +  id +" \
                        AND nombre = '" + usuario + "'";
            bd.query(qr2, function(error, filas){
                if(error)
                {
                    console.log('error al aumentar estado');
                    return;
                }
                let qr3 = "SELECT u.nombre as nombre, \
                u.token as token from usuario u, conversacion c \
                where u.nombre = c.nombre and \
                c.id_conversacion = "+  id +" and u.nombre != '"+ usuario +"';";
                bd.query(qr3, function(error, filas){
                    if(error)
                    {
                        console.log('error al buscar token');
                        return;
                    }
                    var serverKey = 'AAAA4iUUfRc:APA91bFSDG8l61UvTH3y3keSmNfTodFgaH9rNj2IE84z3Ob9YDtZqLkuGFNEv0G3kZnsj_8XYo5I0CCtQ9ZR9ZX1YIgtu01o7ePDcyU8lQuD6W6X-enuPL85zJsFnDTWXB5O61irybXO';
                    var fcm = new FCM(serverKey);
                    var message = { 
                        to: filas[0].token, 
                        
                        notification: {
                            title: usuario, 
                            body: mensaje 
                        },
                    };
                    fcm.send(message, function(err, response){
                        if (err) {
                            console.log("Something has gone wrong!");
                        } else {
                            cb(error, filas);
                        }
                    });
                });
                
            });
         });
    }