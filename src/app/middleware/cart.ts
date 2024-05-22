const Cart = require('../../db/model/cart');
const CartCourse = require('../../db/model/cart-course');

const axios = require('axios');
const createError = require('http-errors');
import { Request, Response, NextFunction } from "express";

class CheckingCart {
    checkAddCourseToCart = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const { id_course } = req.body.data;
            const id_user = req.student.data.id;

            const cart = await Cart.findOne({
                where: {
                    id_user
                }
            });

            const record = await CartCourse.findOne({
                where: {
                    id_cart: cart.id,
                    id_course
                }
            });

            if (record) {
                let error = "This course already in the cart!";
                return next(createError.BadRequest(error));
            }

            next();

        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkDeleteCourseFromCart = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const { id_course } = req.body.data;
            const id_user = req.student.data.id;

            const cart = await Cart.findOne({
                where: {
                    id_user
                }
            });

            const record = await CartCourse.findOne({
                where: {
                    id_cart: cart.id,
                    id_course
                }
            });

            if (!record) {
                let error = "This course does not in cart!";
                return next(createError.BadRequest(error));
            }

            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingCart();