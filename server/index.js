require('dotenv').config();
const express = require('express');
const passport = require('passport');
const sessions = require('express-session');
const massive = require('massive');
const bcrypt = require('bcrypt');
// Passport Strategies
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// ENV VARIABLE
const {
    CONNECTION_STRING,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET
} = process.env

// App Setup
const app = express();

// Middleware
app.use(express.json());
app.use(sessions({
    secret: 'passport auth examples 🚀',
    resave: true,
    saveUninitialized: true
}));
// need to use the passport initialize middleware to get passport working
app.use(passport.initialize());


// Database Connection
massive(CONNECTION_STRING)
    .then(dbInstance => {
        app.set('db', dbInstance);
        console.log('database is connected')
    })
    .catch(error => {
        if (error) throw error;
    });

/* --- Passport --- */
// Serialize and Deserialize user
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    done(null, id);
});

// Strategies

// local login
passport.use('login', new LocalStrategy({
    passReqToCallback: true
},
    function (req, username, password, done) {
        //store the db instance in a variable
        const db = req.app.get('db');
        //check to make sure username and password exist
        if (username.length === 0 || password.length === 0) {
            return done(null, false, { message: 'Username and Password are required.' })
        }
        //find the user in the database
        db.users.find({ username }).then(userResults => {
            //if the user is not found, return an error message
            if (userResults.length == 0) {
                return done(null, false, { message: 'User does not exist.' })
            };
            //if user is found, store the user
            const user = userResults[0];
            //store users password
            const storedPassword = user.password;
            //if the stored encrypted password doesn't match the password from the client, return an error message
            if (!bcrypt.compareSync(password, storedPassword)) {
                return done(null, false, { message: 'Invalid username or password.' });
            };
            //if the passwords match, remove the password from the user before sending back the user information
            delete user.password;
            //return the user information
            return done(null, user);
        })
            .catch(error => {
                console.warn(error);
            });
    }
));

// local register
passport.use('register', new LocalStrategy({
    //allow data from the req object to be accessed and routes to redirect to
    passReqToCallback: true,
},
    function (req, username, password, done) {
        //store the db instance in a variable
        const db = req.app.get('db');
        //hash and encrypt the new users password
        const hashedPassword = bcrypt.hashSync(password, 15);
        //check to see if there is already a user with that username
        db.users.find({ username }).then(userResults => {
            if (userResults.length > 0) {
                return done(null, false, { message: 'Username is already taken.' });
            }
            //if username is not already in use, create the new user
            return db.users.insert({
                username,
                password: hashedPassword,
            });
        }).then(user => {
            //remove user password before sending back
            delete user.password;
            //send user back to client
            done(null, user);
        }).catch(err => {
            console.warn(err)
            done(null, false, { message: 'Unkown error, please try again.' });
        });
    }
));

// Google strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3005/auth/google/callback',
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, cb) => {
    //get the db instance
    const db = req.app.get('db');
    // find the user
    db.users.find({googleid: profile.id})
        .then(users => {
            // if user doesn't exist, store in db
            if(users.length === 0){
                return db.users.insert({
                    googleid: profile.id,
                    username: profile.displayName
                })
            };
            // else return the user
            return cb(null, users[0])
        })
        .then(user => {
            return db(null, user)
        })
}));


// local strat login
app.post('/auth/local/login', passport.authenticate('login'), (req, res) => {
    res.send(req.user)
});

// local strat register
app.post('/auth/local/register', passport.authenticate('register'), (req, res) => {
    res.send(req.user);
});

// Google strategy
app.get('/auth/google', passport.authenticate('google', { scope: "profile" }));

app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
    console.log(req.user)
    res.send(req.user);
});

// Server Listening
app.listen(3005, () => console.log('Server Running'));