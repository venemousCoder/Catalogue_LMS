const mongoose = require('mongoose');

const requestSchema = mongoose.Schema({
    requester: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    bookRequested: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'books'
    }
}, { timestamps: true });

module.exports = mongoose.model('requests', requestSchema)