const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

/**
 * @route   POST /payments/moncash/webhook
 * @desc    Recevoir les callbacks de MonCash
 * @access  Public (appelé par MonCash)
 */
router.post('/moncash/webhook', webhookController.handleMonCashWebhook);

module.exports = router;
