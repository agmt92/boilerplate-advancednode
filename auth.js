const passport = require('passport');
const bcrypt = require('bcrypt');


module.exports = function (app, myDataBase) {
    console.log('auth.js loaded');

    app.route('/login').post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
        res.redirect('/profile');
      });

      app.route('/auth/github').
        get(passport.authenticate('github'));

      app.route('/auth/github/callback').
        get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
          res.redirect('/profile');
        });

      app.route('/profile').get(ensureAuthenticated, (req,res) => {
        res.render('profile', { username: req.user.username });
      });

      app.route('/register').post((req, res, next) => {
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.findOne({ username: req.body.username }, (err, user) => {
          if (err) {
            next(err);
          } else if (user) {
            res.redirect('/');
          } else {
            myDataBase.insertOne({
              username: req.body.username,
              password: hash
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

      passport.serializeUser((user, done) => {
        done(null, user._id);
      });
      
      passport.deserializeUser((id, done) => {
        myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
          done(null, doc);
        });
      });

      function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');
      };

}
