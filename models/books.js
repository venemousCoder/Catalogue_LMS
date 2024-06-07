const mongoose = require('mongoose');

const bsc = mongoose.Schema

const bookSchema = new bsc({
    title: {
        type: String,
        required: false
    },
    imageUrl: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    desc: {
        type: String,
        required: false
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    pendingBorrower: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'user'
        }

    ],
    borrowers: [
        {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'user'
        }

    ],
    quantity: { type: Number }

})

module.exports = mongoose.model('books', bookSchema);
