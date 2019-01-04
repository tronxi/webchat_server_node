const express=require('express');
const app=express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

cl = require('./node/consultas.js');

app.use(express.static(__dirname));

var cors = require('cors')
 
app.use(cors())

app.get('/', (req, res) => {
    let usuario, pass;
    usuario = req.params.usario;
    pass = req.params.pass;
    cl.login(function(error, resultado)
    {
        if(error)
        {
            throw error;
        }
        else
        {
            res.send("resultado");
        }
    }, usuario, pass);
  })
        
const server=app.listen(8888, () => {
  console.log('Servidor web iniciado');
});