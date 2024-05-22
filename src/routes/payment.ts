const express = require('express');
const router = express.Router();

const PaymentController = require('../app/controllers/PaymentController');
const Authorize = require('../app/middleware/authorize');
const CheckingTransaction = require('../app/middleware/transaction');

router.route('/transactions/:studentId')
    .get(
        Authorize.verifyUser, 
        CheckingTransaction.checkGetTransactionsOfStudent, 
        PaymentController.getTransactionsOfStudent
    );

router.route('/transactions/teacher/:teacherId/page/:page')
    .get(
        Authorize.verifyUser,
        CheckingTransaction.checkGetTrantrationsOfTeacher,
        PaymentController.getTransactionOfTeacher
    );

router.route('/transactions/:studentId/:transactionId')
    .get(
        Authorize.verifyUser, 
        CheckingTransaction.checkGetDetailOfTransaction, 
        PaymentController.getDetailOfTransaction
    );

router.route('/pay')
    .post(
        Authorize.verifyStudent, 
        PaymentController.payByScanQRCode
    );

router.route('/receive-ipn')
    .post(
        Authorize.verifyStudent, 
        PaymentController.receiveInstantPaymentNotification
    );

module.exports = router;

export {}