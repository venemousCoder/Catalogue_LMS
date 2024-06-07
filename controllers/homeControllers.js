const mongoose = require("mongoose");
const books = require("../models/books");
const requests = require("../models/requests");
const { user } = require("../models/user");

function redirect(req, res) {
    res.locals.currentUser
    res.locals.data
    return res.redirect(res.locals.redirect);
}


function getIndex(req, res) {
    books.find({}).sort({ title: 1 })
        .then((books) => {
            res.render('index.ejs', { books, loggedIn: res.locals.loggedIn, currentUser: res.locals.currentUser, error: res.locals.error });
        })
        .catch((error) => {
            res.locals.error = error;
            res.status(500).redirect('error.ejs');
        })
}

function borrow(req, res) {
    const bookId = mongoose.Types.ObjectId.createFromHexString(req.body.id)
    books.findByIdAndUpdate(bookId, { $addToSet: { pendingBorrower: res.locals.currentUser.id } }, { new: true })
        .then((updatedBook) => {
            const newRequest = {
                requester: res.locals.currentUser.id,
                bookRequested: req.body.id
            }
            requests.create(newRequest)
                .then((request) => {
                    user.findByIdAndUpdate(res.locals.currentUser.id, { $addToSet: { borrowRequests: request.id } }, { new: true })
                        .then((updatedUser) => {
                            res.locals.currentUser = updatedUser;
                            res.json(updatedBook);
                        })
                        .catch((error) => {
                            console.log('failed to update user record', error)
                            res.status(500).redirect('/error')
                        })

                })
                .catch((error) => {
                    console.log('failed to create a request', error)
                    return res.status(500).render('error.ejs', { err: error });
                })
        })
        .catch((error) => {
            console.log('failed to update book for borrowing', error);
            return res.status(500).render('error.ejs', { err: error });
        })
}

module.exports = {
    getIndex,
    borrow,
    redirect
}
