const mongoose = require('mongoose');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const userShchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
    },
    borrowRequests: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'requests'
    }],
    booksBorrowed: [{
        type: mongoose.Schema.ObjectId,
        ref: 'books'
    }]
}, { timeStamps: true });

mongoose.plugin(passportLocalMongoose);

const validateUserPassword = async (username, password) => {
    return new Promise((resolve, reject) => {

        passport.authenticate('local', (err, admin, info) => {
            if (err || !admin) {
                return reject(false);
            }
            console.log('result', 'passed', info)
            return resolve(true)
        })({ body: { username, password } });
    })
}

const user = mongoose.model('user', userShchema);
module.exports = {user, validateUserPassword}
