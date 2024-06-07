const router = require('express').Router();
const adminControllers = require('../controllers/adminControllers');
const moderatorControllers = require('../controllers/moderatorControllers');
const homeControllers = require('../controllers/homeControllers')

router.get('/', adminControllers.adminLogin);
router.post('/', adminControllers.adminPanel, homeControllers.redirect);
router.get('/logout', adminControllers.logout, homeControllers.redirect);

/****************************PROTECTED ROUTES ***/

router.use(adminControllers.verifyJwt);

router.get('/moderator/addBook', moderatorControllers.addBookPage);
router.get('/moderator/updateBook/:book', moderatorControllers.updateBookPage);
router.get('/create', adminControllers.adminCreate);
router.get('/profile', adminControllers.panel);

router.get('/notifications', moderatorControllers.getNotifications, moderatorControllers.borrowRequests);
router.patch('/notifications', moderatorControllers.updateNotifications);
router.delete('/notifications', moderatorControllers.updateNotifications);

router.get('/borrowmanagement', moderatorControllers.borrowManagementPage);
router.patch('/borrowmanagement/', moderatorControllers.updateBorrowers);
router.delete('/borrowmanagement/', moderatorControllers.updateBorrowers);
router.post('/moderator/addBook', moderatorControllers.addBook, homeControllers.redirect);
router.delete('/moderator/book/:bookid', moderatorControllers.deleteBook, homeControllers.redirect);
router.patch('/moderator/updateBook/:book', moderatorControllers.updateBook, homeControllers.redirect);
router.post('/create', adminControllers.createAdmin, homeControllers.redirect);

module.exports = router
