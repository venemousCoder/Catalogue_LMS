const mongoose = require('mongoose');
const books = require('../models/books');
const requests = require('../models/requests');
const { user } = require('../models/user');


function addBookPage(req, res) {
    res.render('addBook.ejs', { logged: req.isAuthenticated() })
}
function updateBookPage(req, res) {
    res.render('updateBook.ejs', { logged: req.isAuthenticated(), id: req.params.book })
}

function addBook(req, res, next) {
    const newBook = {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        desc: req.body.desc,
        author: req.body.author,
        genre: req.body.genre,
        availability: req.body.availability === 'on' ? 'Available' : 'Not available',
        quantity: req.body.quantity
    }
    books.create(newBook)
        .then(() => {
            res.locals = {
                redirect: 'addBook',
                error: null
            }
            next();
        })
        .catch((error) => {
            res.locals = {
                redirect: '/error',
                error: error,
            }
            console.log(error)
            next();
        })
}

function updateBook(req, res, next) {
    const bookUpdate = {
        title: req.body.title,
        imageUrl: req.body.imageUrl,
        price: req.body.price,
        desc: req.body.desc,
        author: req.body.author,
        genre: req.body.genre,
        availability: req.body.availability === 'on' ? 'Available' : 'Not available',
        quantity: req.body.quantity
    }
    books.findByIdAndUpdate(req.params.book, { $set: bookUpdate }, { new: true })
        .then((book) => {
            console.log('in update', book)
            res.locals = {
                redirect: '/admin/profile',
                error: null,
                data: book
            }
            next();
        })
        .catch((error) => {
            res.locals = {
                redirect: '/error',
                statusCode: 500,
                error: error,
            }
            next();
        })
}

function deleteBook(req, res, next) {
    const bookId = mongoose.Types.ObjectId.createFromHexString(req.params.bookid);
    books.findByIdAndDelete(bookId)
        .then((delBook) => {
            res.locals = {
                redirect: '/admin/profile',
                error: null
            }
            console.log('successfully deleted', delBook.title)
            next();
        })
        .catch((error) => {
            console.log('Could not delete book')
            res.locals = {
                redirect: '/error',
                statusCode: 500,
                error: error,
            }
            next();
        })
}

function updateNotifications(req, res) {
    if (req.query._method === 'PATCH') {
        const reqId = mongoose.Types.ObjectId.createFromHexString(req.body.id)
        requests.findByIdAndDelete(reqId).populate(['requester', 'bookRequested'])
            .then((approvedRequest) => {
                books.findByIdAndUpdate(approvedRequest.bookRequested.id, { $addToSet: { borrowers: approvedRequest.requester.id }, $pull: { pendingBorrower: approvedRequest.requester.id } }, { new: true })
                    .then((book) => {
                        user.findByIdAndUpdate(approvedRequest.requester.id, { $addToSet: { booksBorrowed: book.id }, $pull: { borrowRequests: approvedRequest.id } }, { new: true })
                            .then((updatedUser) => {
                                res.json(updatedUser);
                            })
                            .catch((error) => {
                                console.log('could not update user', error);
                                return res.redirect('/error', 500);
                            })
                    })
                    .catch((error) => {
                        console.log('could not update book', error);
                        return res.redirect('/error', 500);
                    })
            })
            .catch((error) => {
                console.log('could not delete request', error);
                return res.redirect('/error', 500);
            })
    }
    else if (req.query._method === 'DELETE') {
        const id = mongoose.Types.ObjectId.createFromHexString(req.query.id)
        requests.findByIdAndDelete(id)
            .populate(['requester', 'bookRequested'])
            .then((approvedRequest) => {
                const appreqid = mongoose.Types.ObjectId.createFromHexString(approvedRequest.requester.id)
                books.findOneAndUpdate({ _id: approvedRequest.bookRequested.id }, { $pull: { pendingBorrower: appreqid } }, { new: true })
                    .then(() => {
                        user.findOneAndUpdate({ _id: approvedRequest.requester.id }, { $pull: { borrowRequests: approvedRequest.id } }, { new: true })
                            .then((updatedUser) => {
                                return res.status(200).json(updatedUser);
                            })
                            .catch((error) => {
                                console.log('could not update user', error);
                                return res.status(500).redirect('/error');
                            })
                    })
                    .catch((error) => {
                        console.log('could not update book', error);
                        return res.status(500).redirect('/error');
                    })
            })
            .catch((error) => {
                console.log('could not delete request', error);
                return res.status(500).redirect('/error');
            })
    }
}

function borrowRequests(req, res) {
    res.render('requests.ejs', { books: res.locals.data, currentUser: res.locals.currentUser })
}

function getNotifications(req, res, next) {
    requests.find().sort({ timestamps: -1 }).populate(['requester', 'bookRequested'])
        .then((requests) => {
            console.log(requests)
            res.locals = {
                redirect: 'borrowRequests',
                error: null,
                data: requests,
                loggedIn: req.isAuthenticated(),
                currentUser: req.user
            }
            next()
        })
}

function borrowManagementPage(req, res) {
    books.find().populate('borrowers')
        .then((book) => {
            return res.render('bookmanagement.ejs', { books: book })
        })
        .catch((error) => {
            return res.render('error.ejs', { err: error });
        })
}

function updateBorrowers(req, res) {
    if (req.query._method === 'PATCH') {
        const userid = mongoose.Types.ObjectId.createFromHexString(req.body.id)
        const bookid = mongoose.Types.ObjectId.createFromHexString(req.body.bookid)
        user.findByIdAndUpdate(userid, { $pull: { booksBorrowed: bookid } }, { new: true })
            .then((updatedUser) => {
                books.findByIdAndUpdate(bookid, { $pull: { borrowers: updatedUser.id } }, { new: true })
                    .then(() => {
                        res.status(200).json(updatedUser);
                    })
                    .catch((error) => {
                        console.log('could not update book', error);
                        return res.status(500).json(error).redirect('/error');
                    })
            })
            .catch((error) => {
                console.log('could not delete request', error);
                return res.status(500).json(error).redirect('/error');
            })
    }
    else if (req.query._method === 'DELETE') {
        console.log('SENDING EMAIL')
        res.json({ data: 'Sending email' })
    }
}
module.exports = {
    addBookPage,
    updateBookPage,
    addBook,
    updateBook,
    deleteBook,
    updateNotifications,
    getNotifications,
    borrowRequests,
    borrowManagementPage,
    updateBorrowers
}
