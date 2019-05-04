const express=require('express');
const app=express();
var server = require('http').Server(app);
var io = require('socket.io')(server, { origins: '*:*'});
var iconv = require('iconv-lite');

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

cl = require('./node/consultas.js');

app.use(express.static(__dirname));

var cors = require('cors')
 
app.use(cors())

app.get('//', (req, res) => 
{
    res.send('Servidor webChat funcionando');
});

io.on('connect', function(socket) {
    console.log('Un cliente se ha conectado');
    socket.on('union', function(data){
        socket.join(data.id);
        console.log('unido a sala ' + data.id);
        //io.sockets.in(data).emit('message', 'socket');
    });
    socket.on('salir', function(data){
        socket.leave(data.id);
        console.log('salir a sala ' + data.id);
        //io.sockets.in(data).emit('message', 'socket');
    });
});

app.post('//login', (req, res) => {
    let usuario, pass;
    usuario = req.body.usuario;
    pass = req.body.pass;
    cl.login(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send(JSON.stringify(resultado));
        }
    }, usuario, pass);
  });
  app.post('//token', (req, res) => {
    let usuario, token;
    usuario = req.body.usuario;
    token = req.body.token;
    cl.token(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send(JSON.stringify(resultado));
        }
    }, usuario, token);
  });

  app.post('//registro', (req, res) => {
    let usuario, pass;
    usuario = req.body.usuario;
    pass = req.body.pass;
    cl.registro(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            io.sockets.emit('nuevo-usuario', 'actualizar');
            res.send(JSON.stringify(resultado));
        }
    }, usuario, pass);
  })

  app.post('//conversacionUsuario', (req, res) => {
    let usuario;
    usuario = req.body.usuario;
    cl.conversacionUsuario(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send(JSON.stringify(resultado));
        }
    }, usuario);
  })
  app.post('//personas', (req, res) => {
    let usuario;
    usuario = req.body.usuario;
    cl.personas(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send(JSON.stringify(resultado));
        }
    }, usuario);
  })

  app.post('//crearConversacion', (req, res) => {
    let usuario, persona;
    usuario = req.body.usuario;
    persona = req.body.persona;
    cl.crearConversacion(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send(JSON.stringify(resultado));
        }
    }, usuario, persona);
  })

  app.post('//mostrarMensajes', (req, res) => {
    let usuario, id;
    usuario = req.body.usuario;
    id = req.body.id;
    cl.mostrarMensaje(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            mensajes = JSON.stringify(resultado);
            for(let i = 0; i < mensajes.length; i++) {
                console.log('antes de nada' + mensajes[i].texto2);
                nuevoMensaje = iconv.encode(mensajes[i].texto2, 'ISO-8859-1');
                console.log('Despues de encode latin ' + nuevoMensaje)
                nuevoMensaje = iconv.decode(nuevoMensaje, 'utf-8');
                console.log('Despues de decode utf-8 ' + nuevoMensaje)
                mensajes[i].texto2 = nuevoMensaje;
            }
            console.log(mensajes);
            res.send(mensajes);
        }
    }, usuario, id);
  })

  app.post('//enviarMensaje', (req, res) => {
    let usuario, id, mensaje;
    usuario = req.body.usuario;
    id = req.body.id;
    mensaje = req.body.mensaje;
    cl.enviarMensaje(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            io.sockets.in(id).emit('actualizar-mensajes', 'actualizar');
            io.sockets.emit('nuevo-mensaje', 'actualizar');
            res.send(JSON.stringify(resultado));
        }
    }, mensaje, usuario, id);
  })


        
server.listen(8889, () => {
  console.log('Servidor web iniciado');
});