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
    console.log(usuario);
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
        
const server=app.listen(8889, () => {
  console.log('Servidor web iniciado');
});