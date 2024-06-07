const mongoose = require('mongoose');
const passport = require('passport');
const PLM = require('passport-local-mongoose')

const adminSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    requests: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },],
    role: { type: String }
});

mongoose.plugin(PLM);

const validatePassword =
    async (username, password) => {
        return new Promise((resolve, reject) => {

            passport.authenticate('adminS', (err, admin, info) => {
                if (err || !admin) {
                    return reject(false);
                }
                console.log('result admin', 'passed', info)
                return resolve(true)
            })({ body: { username, password } });
        })
    }
const admin = mongoose.model('admin', adminSchema);
module.exports = { admin, validatePassword }
