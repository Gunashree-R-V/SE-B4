const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const server = express();
require('dotenv').config();

const admin = require('./routes/admin');
const sos = require('./routes/sos');
const signUp = require('./routes/signup');
const login = require('./routes/login');
const userTripUpdate = require('./routes/userTripUpdate');

server.set('PORT', 4002);
// Static pages which doesn't require Rest API calls. 
// server.use(express.static(__dirname + '/public'));
server.use(express.static('public'));
server.use(express.static('views'));
server.use(bodyParser.urlencoded({ extended: true }));

server.engine('.html',require('ejs').__express);
server.set('views',path.join(__dirname,'views/'));
server.set('view engine','html');

server.use('/',admin);
server.use('/',sos);
server.use('/',login);
server.use('/', signUp);
server.use('/',userTripUpdate);

server.get('/', (req, res, next) => {
    res.sendFile('index.html',{root: './views'});
});

server.listen(server.get('PORT'), () => {
    console.log(`Server is running at http://localhost:${server.get('PORT')} in ${server.get('env')} mode`);
});
