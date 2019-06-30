const express = require('express');
const passport = require('passport')
const sessions = require('express-session');
const massive = require('massive');
// Passport Strategies
const LocalStrategy = require('passport-local');

// App Setup
const app = express();

// Middleware
app.use(express.json());
app.use(sessions({
    secret: 'passport auth examples 🚀'
}));
// need to use the passport initialize middleware to get passport working
app.use(passport.initialize());


// Database Connection


/* --- Passport --- */


// Server Listening
app.listen(3005, () => console.log('Server Running'));