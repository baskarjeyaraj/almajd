
const process = require('process')
const fs = require('fs')
const express = require('express')
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '100mb', 
  parameterLimit: 100000000
}));
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))

const passport = require('passport')
const session = require('express-session')
const { success, error } = require("consola")
const cors = require('cors')
app.use(cors());
// app.use(express.json({limit: '100mb'}));
// app.use(express.urlencoded({limit: '100mb'}));
app.use(session({
  secret: 'process.env.SESSION_SECRET',
  resave: false,
  saveUninitialized: false
}))

app.set('port', (process.env.PORT || 5555))
app.use(express.static(__dirname + '/public'))

app.use('/api', require('./routes'));
 app.get('/', function(req, res){
  res.send("Hello from the 'main' URL");
});

 app.get('/test', function(req, res){
  res.send("Test-Route-Hello from the 'test' URL");
});

 app.get('/test1', function(req, res){
  res.send("Test-Route-Hello from the 'test1' URL");
});


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
