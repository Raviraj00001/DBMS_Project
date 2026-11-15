const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken, requireRole } = require('../middlewares/auth');

router.post('/', verifyToken, requireRole('customer'), supportController.createRequest);
router.get('/mine', verifyToken, requireRole('customer'), supportController.getMyRequests);
router.get('/admin', verifyToken, requireRole('admin'), supportController.getAllRequests);
router.patch('/:id', verifyToken, requireRole('admin'), supportController.updateRequest);

module.exports = router;
