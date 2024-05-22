const express = require('express');
const router = express.Router();

const CartController = require('../app/controllers/CartController');
const Authorize = require('../app/middleware/authorize');
const CheckingCart = require('../app/middleware/cart');

router.route('/')
    .post(CartController.createCart);

router.route('/student')
    .get(Authorize.verifyStudent, CartController.getCartOfStudentByStudentId)
    .post(Authorize.verifyStudent, CheckingCart.checkAddCourseToCart, CartController.addCourseToCart)
    .delete(Authorize.verifyStudent, CheckingCart.checkDeleteCourseFromCart, CartController.deleteCourseFromCart);

router.route('/check/:courseId/:studentId')
    .get(CartController.checkCourseInCart);

    
module.exports = router;