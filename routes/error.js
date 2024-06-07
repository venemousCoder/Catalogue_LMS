const router = require('express').Router();
const errorController = require('../controllers/errorControllers');

router.get('*', errorController.error);

module.exports = router
