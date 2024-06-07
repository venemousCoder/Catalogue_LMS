const router = require('express').Router();
// const { verifyJwt } = require('../controllers/adminControllers');
const userControllers = require('../controllers/userControllers'),
    homeControllers = require('../controllers/homeControllers');

//************************************GET ROUTES************************************************** */

router.get('/create', userControllers.getCreate);
router.get('/login', userControllers.getLogin);


//************************************POST ROUTES************************************************** */

router.post('/login', userControllers.userlogin, homeControllers.redirect);
router.post('/create', userControllers.postCreate, homeControllers.redirect)

//************************************PROTECTED ROUTES************************************************** */

// router.use(verifyJwt)
router.get('/profile', userControllers.profile);
router.get('/logout', userControllers.logout, homeControllers.redirect);
module.exports = router;