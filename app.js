const express = require('express');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();
const app = express();
const router = require('./routes/index');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { user, validateUserPassword } = require('./models/user')
const session = require('express-session');
const { admin, validatePassword } = require('./models/admin');
const methodOverride = require('method-override');
const { generateToken } = require('./controllers/adminControllers');

//settings
mongoose.connect('mongodb://127.0.0.1:27017/libraryDB')
    .then(() => console.log('Connected to DataBase'))
    .catch(err => console.log(err))
app.set('view engine', ejs);
app.set('port', process.env._PORT || 5000);
app.use(
    methodOverride('_method', {
        methods: ['POST', 'GET'],
    })
);
//further settings
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    cookie: {
        maxAge: new Date().setDate(new Date().getDate() + 1)
    },
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));

app.use(passport.initialize());
app.use(passport.session());


passport.use('user', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    user.findOne({ username: username })
        .then(async (admins) => {
            if (!admins) {
                return done(null, false, { message: 'incorrect username' })
            }
            const result = await validateUserPassword(username, password);
            if (!result) {
                return done(null, false, { message: 'incorrect username or password' })
            }
            req.logIn(admins, (err) => {
                if (err) {
                    console.log('login error', err)
                }
                const token = generateToken(admins);
                app.set('token', token);
                return done(null, admins);
            })
        })
        .catch((error) => {
            console.log('admin log in failed: ', error)
            return done(error)
        })
}
));

passport.use('admin', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, (req, username, password, done) => {
    admin.findOne({ username: username })
        .then(async (admins) => {
            if (!admins) {
                return done(null, false, { message: 'incorrect username' })
            }
            const result = await validatePassword(username, password);
            if (!result) {
                return done(null, false, { message: 'incorrect username or password' })
            }
            req.logIn(admins, (err) => {
                if (err) {
                    console.log('login error', err)
                }
                const token = generateToken(admins);
                app.set('token', token);
                return done(null, admins);
            })
        })
        .catch((error) => {
            console.log('admin log in failed: ', error)
            return done(error)
        })
}
));


passport.use('user', user.createStrategy());
passport.use('adminS', admin.createStrategy());

passport.serializeUser((users, done) => {
    if (users.role === 'admin') {
        done(null, { type: 'admin', id: users.id })
    } else if (users.role === 'moderator') {
        done(null, { type: 'moderator', id: users.id })
    }
    else {
        user.serializeUser()
        done(null, { type: 'user', id: users.id })
    }
});

passport.deserializeUser((obj, done) => {
    if (obj.type === 'admin' || obj.type === 'moderator') {
        admin.findById(obj.id)
            .then((admin) => {
                done(null, admin)
            })
            .catch((err) => {
                console.log('admin deserialization eerror: ', err)
            })
    } else {
        user.findById(obj.id)
            .then((users) => {
                user.deserializeUser()
                done(null, users)
            })
            .catch((err) => {
                console.log('user deserialization eerror: ', err)
            })
    }
});

app.use((req, res, next) => {
    // console.log('majik',appli.app.get('book'));
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    res.locals.token = app.get('token');
    console.log(`\nURL: ${req.url}\n METHOD: ${req.method}\n BODY: ${req.body.username}`);
    return next();
});

//routes
app.use('/', router)

//server
app.listen(app.get('port'), (err) => {
    if (err) {
        console.log(err)
    }
    console.log(`Server listening at ${app.get('port')}.`)
})
