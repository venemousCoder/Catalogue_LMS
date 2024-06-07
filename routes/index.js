const router = require('express').Router();
const homeRouter = require('./home');
const errorRouter = require('./error');
const userRouter = require('./user');
const adminRouter = require('./admin');
const apiRouter = require('./api');

router.use('/user', userRouter);
router.use('/', homeRouter);
router.use('/admin', adminRouter);
router.use('/api', apiRouter);
router.use('/', errorRouter);

module.exports = router