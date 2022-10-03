var express = require('express');
const { use } = require('passport');


var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local');

//Modele 
const user = require('../model/user');

// Configuration de la connexion pour avec Passport
passport.use(new LocalStrategy( function verify(username, password, cb) {
    user.findOne({username: username}, async function(err, user){
        if (user === null) {
            return cb(null, false, { message : "L'utilisateur n'existe pas."})
        }
        else {
            var valid = user.validPassword(password);
            if (valid) {
                var handler = await user.initConnection();
                console.log(handler);
                return cb(null, {user : user, hand : handler });
            }
            else return cb(null, false, { message : "Mot de passe incorrect"});
        }
    })
}));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.user._id, username: user.user.username, info_connect : user.hand });
    });
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
});

// Route de connextion

router.post('/login' ,passport.authenticate('local', {
    successRedirect: '/accueil',
    failureRedirect: '/login',
    failureFlash: false
}));

router.post('/signup' , (req, res, next) => {
    var newUser = new user();
    // Initialize newUser object with request data
    newUser.username = req.body.username;  
    // Call setPassword function to hash password
    newUser.setPassword(req.body.password);
    // Save newUser object to database
    newUser.save((err, user) => {
        if (err) {
            res.redirect('/signup')
        }
        else {
            res.redirect('/login')
        }
    });
});

module.exports = router;