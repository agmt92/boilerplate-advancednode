'use strict';
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');



const routes = require('./routes.js');
const auth = require('./auth.js');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);


app.set('view engine', 'pug');
app.set('views', './views/pug');



app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  github: { clientID: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');
  console.log('Connected to database');
  routes(app, myDataBase);
  auth(app, myDataBase);
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
let currentUsers = 0;
io.on('connection', socket => {
  ++currentUsers;
  io.emit('user count', currentUsers);
  console.log('A user has connected');

});
  
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});