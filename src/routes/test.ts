const express = require('express');
const router = express.Router();

const PaymentController = require('../app/controllers/PaymentController');

router.route('/')
    .get(PaymentController.payByScanQRCode);

module.exports = router;

export {}