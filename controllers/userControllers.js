const passport = require('passport');
const { user } = require('../models/user');
const jsonwebtoken = require("jsonwebtoken");
const { app } = require('./adminControllers');

function generateToken(user) {
    if (user) {
        let signedToken = jsonwebtoken.sign(
            {
                data: user._id,
                exp: new Date().setDate(new Date().getDate() + 1)
            },
            "1234567890"
        );
        return signedToken;
    }
    return new Error('userException: user not found');
}


function getLogin(req, res) {
    res.render('login.ejs', { error: null });
}

function getCreate(req, res) {
    res.render('create.ejs', { error: null })
}

function profile(req, res) {
    res.render('user.ejs', { loggedIn: req.isAuthenticated(), currentUser: res.locals.currentUser });
}



function postCreate(req, res, next) {
    const newUser = {
        username: req.body.username,
        email: req.body.email,
        role: req.body.role
    }
    const createNewUser = new user(newUser);
    user.register(createNewUser, req.body.password, (err, user) => {
        if (err) {
            console.log(err)
            res.locals = {
                redirect: 'user/create',
                error: err
            }
           return next()
        }
        if (!user) {
            res.locals = {
                redirect: 'user/create',
                error: 'Account not created try again'
            }
            console.log(res.locals.error)
           return next()
        }
        req.login(user, (err) => {
            if (err) {
                res.locals = {
                    redirect: 'user/create',
                    error: err
                }
                console.log(res.locals.error)
               return next()
            }
            const signedToken = generateToken(req.user);
            app.set('token', signedToken);
            res.locals = {
                redirect: 'profile',
                error: null,
                token: signedToken,
                loggedIn: req.isAuthenticated(),
                currentUser: req.user
            }
           return next()
        })
    })
}

function userlogin(req, res, next) {
    passport.authenticate('user', (error, user) => {
        if (!user) {
            res.locals = {
                redirect: 'login',
                error: 'Failed to login',
            }
            console.log('Login failed: user not found', user);
           return next()
        }
        if (error) {
            res.locals = {
                redirect: 'login',
                error: error,
            }
            console.log('Login failed: authentication error: ', error);
           return next()
        }
        req.logIn(user, (err) => {
            if (err) {
                res.locals = {
                    redirect: 'login',
                    error: err,
                }
                // throw new Error(err)
                // console.log('Login failed: ', err);
               return next()
            }
            const signedToken = generateToken(req.user);
            app.set('token', signedToken)
            res.locals = {
                redirect: 'profile',
                error: null,
                token: signedToken,
                loggedIn: req.isAuthenticated(),
                currentUser: req.user
            }
            console.log('User logged')
           return next()
        })
    })(req, res, next)
}


function logout(req, res, next) {
    req.logout((error) => {
        if (error) {
            console.log('logout failed: ', error);
            res.locals = {
                redirect: '/',
                error: error,
            }
           return next()
        }
        res.locals = {
            redirect: 'login',
            error: null,
        }
       return next()
    })
}

module.exports = {
    getLogin,
    getCreate,
    postCreate,
    userlogin,
    profile,
    logout
}
