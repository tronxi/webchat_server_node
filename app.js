const express=require('express');
const app=express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

cl = require('./node/consultas.js');

app.use(express.static(__dirname));

var cors = require('cors')
 
app.use(cors())

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
  })

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
            res.send(JSON.stringify(resultado));
        }
    }, usuario, pass);
  })

  app.post('//conversacionUsuario', (req, res) => {
    let usuario, pass;
    usuario = req.body.usuario;
    cl.conversacion(function(error, resultado)
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
        
const server=app.listen(8889, () => {
  console.log('Servidor web iniciado');
});