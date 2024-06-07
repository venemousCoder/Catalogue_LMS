const passport = require('passport');
const { admin } = require('../models/admin');
const jsonwebtoken = require('jsonwebtoken');
const books = require('../models/books');
const { user } = require('../models/user');
const app = require('express')();
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

function adminLogin(req, res) {
    res.render('adminlogin.ejs', { error: res.locals.error });
}
function panel(req, res) {
    if (req.user.role === 'admin') {
        user.find({})
            .then((users) => {
                res.render('admin.ejs', { users });
            })
    } else if (req.user.role === 'moderator') {
        books.find({})
            .then((book) => {
                res.render('moderator.ejs', { data: book });
            })
    }
}
function adminCreate(req, res) {
    res.render('adminCreate.ejs', { error: res.locals.error });
}

function createAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        const newAdmin = {
            username: req.body.username,
            role: req.body.role
        };
        const admins = new admin(newAdmin)
        admin.register(admins, req.body.password, (err, user) => {
            if (err) {
                res.locals = {
                    redirect: 'create',
                    error: err
                }
                console.log(err)
                next()
            }
            if (!user) {
                res.locals = {
                    redirect: 'create',
                    error: 'Account not created try again'
                }
                console.log('not created')
                next()
            }
            req.logIn(user, (err) => {
                if (err) {
                    res.locals = {
                        redirect: 'create',
                        error: err
                    }
                    console.log(err)
                    next()
                }
                const signedToken = generateToken(user)
                app.set('token', signedToken)
                res.locals = {
                    redirect: 'profile',
                    error: null,
                    token: signedToken,
                    loggedIn: req.isAuthenticated(),
                    currentUser: req.user
                }
                next();
            })
        })
    } else {
        res.locals = {
            redirect: 'error',
            error: 'An error occured!',
        }
        next()
    }
}

function adminPanel(req, res, next) {
    passport.authenticate('admin', (err, user) => {
        if (err) {
            res.locals = {
                redirect: '/admin/login',
                error: err,
            }
            next()
        }
        if (!user) {
            res.locals = {
                redirect: '/admin/login',
                error: 'user not found',
            }
            next()
        }
        res.locals = {
            redirect: 'admin/profile',
            error: null,
            loggedIn: req.isAuthenticated(),
            currentUser: req.user
        }
        next()
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
            next()
        }
        res.locals = {
            redirect: '/admin',
            error: null,
        }
        next()
    })
}




function verifyJwt(req, res, next) {
    const token = res.locals.token || app.get('token') || req.query.token
    if (token) {
        jsonwebtoken.verify(token, '1234567890', (error, payload) => {
            if (payload) {
                admin
                    .findById(payload.data).then(user => {
                        if (user) {
                            return next();
                        } else {
                            return res.status(401).json({
                                error: error,
                                message: "No User account found."
                            })
                        }
                    })
            } else {
                return res.status(401).json({
                    error: error,
                    message: "Cannot verify API token."
                });
            }
        })
    } else {
        return res.status(401).json({
            error: true,
            message: "Provide Token"
        });
    }
}

module.exports = {
    adminLogin,
    adminPanel,
    createAdmin,
    adminCreate,
    panel,
    logout,
    verifyJwt,
    generateToken,
    app
}