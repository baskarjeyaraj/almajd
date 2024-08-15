const express = require('express');
const app = express()
 
 
app.use('/student', require('./student'));
app.use('/coach', require('./coach'));
app.use('/attendence', require('./attendence'));
// app.use('/crash', (req, res) => {throw new Error('Intentional crash'); res.send('app crashed')})
 app.get('/', (req, res) => res.send('api'));

module.exports = app;
