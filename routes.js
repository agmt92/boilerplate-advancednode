const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');


module.exports = function (app, myDB) {
    console.log('routes.js loaded');
    app.route('/').get((req, res) => {
        res.render('index', {
          title: 'Connected to Database',
          message: 'Please log in',
          showLogin: true,
          showRegistration: true
        });
      });
    
      app.route('/logout').get((req, res) => {
        req.logout();
        res.redirect('/');
      });

      app.use((req, res, next) => {
        res.status(404)
          .type('text')
          .send('Not Found');
      });

      
      passport.use(new LocalStrategy((username, password, done) => {
        myDataBase.findOne({ username: username }, (err, user) => {
          console.log(`User ${username} attempted to log in.`);
          if (err) { return done(err); }
          if (!user) { return done(null, false); }
          if (!bcrypt.compareSync(password, user.password)) { 
              return done(null, false);
          }
          return done(null, user);
        });
      }));
}
