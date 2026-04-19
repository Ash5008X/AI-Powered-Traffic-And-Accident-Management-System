const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.post('/', auth, alertController.create);
router.get('/active', auth, alertController.getActive);
router.get('/history', auth, alertController.getHistory);
router.patch('/:id/cancel', auth, alertController.cancel);
router.patch('/:id/update', auth, alertController.update);

module.exports = router;