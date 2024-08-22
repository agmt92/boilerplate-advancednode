'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const { ObjectID } = require('mongodb');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views/pug');

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

fccTesting(app); // For fCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

myDB(async client => {
  const myDataBase = await client.db('database').collection('users');

  app.route('/').get((req, res) => {
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please log in',
      showLogin: true,
      showRegistration: true
    });
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  });

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: String, 
  password: String
});

const User = mongoose.model('User', userSchema);

passport.use(new LocalStrategy((username, password, done) => {
  myDataBase.findOne({ username: username }, (err, user) => {
    console.log(`User ${username} attempted to log in.`);
    if (err) return done(err);
    if (!user) return done(null, false);
    if (password !== user.password) return done(null, false);
    return done(null, user);
  });
}));

app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/profile');
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
});


// ensure user is authenticated

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

app.route('/profile').get(ensureAuthenticated, (req, res) => {
  res.render(process.cwd() + '/views/pug/profile', { username: req.user.username });
  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });
});

app.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
    app.use((req, res, next) => {
      res.status(404)
        .type('text')
        .send('Not Found');
    });
});


app.route('/register')
  .post((req, res, next) => {
    myDataBase.findOne({ username: req.body.username }, (err, user) => {
      if (err) {
        next(err);
      } else if (user) {
        res.redirect('/');
      } else {
        myDataBase.insertOne({
          username: req.body.username,
          password: req.body.password
        },
          (err, doc) => {
            if (err) {
              res.redirect('/');
            } else {
              // The inserted document is held within
              // the ops property of the doc
              next(null, doc.ops[0]);
            }
          }
        )
      }
    })
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
}
);