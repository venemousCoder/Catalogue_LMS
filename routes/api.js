const router = require('express').Router();
const apiControllers = require('../controllers/apiControllers');

router.get('/books/:book', apiControllers.getBooks, apiControllers.redirect)

module.exports = router