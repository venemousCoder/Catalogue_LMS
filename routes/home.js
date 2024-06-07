const router = require('express').Router();
const homeControllers = require('../controllers/homeControllers');

router.get('/', homeControllers.getIndex);
router.post('/', homeControllers.borrow);

module.exports = router;
