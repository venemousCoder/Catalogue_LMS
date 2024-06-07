// const jsonwebtoken = require("jsonwebtoken");
const fuse = require('fuse.js');
const books = require("../models/books");

function redirect(req, res) {
    res.json(res.locals.data)
}

function getBooks(req, res, next) {
    books.find()
        .then((books) => {
            const fuser = new fuse(books, { keys: ['title', 'author'] })
            const searchTerm = req.params.book;
            const searchRes = fuser.search(searchTerm)
            res.locals = {
                redirect: '/',
                error: null,
                data: { searchRes, currentUserId: req.user.id }
                // token: signedToken,
                // loggedIn: req.isAuthenticated(),
                // currentUser: req.user
            }
            next()
        })
        .catch((error) => {
            res.locals = {
                redirect: '/',
                error: error,
                // token: signedToken,
                // loggedIn: req.isAuthenticated(),
                // currentUser: req.user
            }
            next()
        })
}

module.exports = {
    getBooks,
    redirect
}