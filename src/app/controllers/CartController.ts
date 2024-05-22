const Cart = require('../../db/model/cart');
const CartCourse = require('../../db/model/cart-course');

const axios = require('axios');
const { sequelize } = require('../../config/db/index');

import { Request, Response, NextFunction } from "express";


class CartController {

    // [POST] /cart
    createCart = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_user = req.body.id_user;

            const cart = await Cart.create({
                id_user
            });

            res.status(201).json(cart);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [GET] /cart/:cartId
    getCartOfStudent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_cart = req.params.cartId;

            const records = await CartCourse.findAll({
                where: { id_cart },
                order: [['createdAt', 'ASC']]
            });
            let courseList = [];

            for (const record of records) {
                const id_course = record.id_course;

                const course = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${id_course}`);
                courseList.push(course.data);
            }

            res.status(200).json(courseList);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [GET] /cart/student
    getCartOfStudentByStudentId = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_student = req.student.data.id;

            const cart = await Cart.findOne({
                where: {
                    id_user: id_student
                }
            });

            const records = await CartCourse.findAll({
                where: { id_cart: cart.id },
                order: [['createdAt', 'ASC']]
            });

            let courseList = [];

            for (const record of records) {
                const id_course = record.id_course;

                const course = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${id_course}`);
                courseList.push(course.data);
            }

            res.status(200).json(courseList);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [GET] /cart/check/:courseId/:studentId
    checkCourseInCart = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_user = req.params.studentId;
            const id_course = req.params.courseId;

            const cart = await Cart.findOne({
                where: { id_user }
            });

            const record = await CartCourse.findOne({
                where: {
                    id_cart: cart.id,
                    id_course
                }
            });

            if (!record) {
                return res.status(200).json({
                    result: false
                });
            }

            res.status(200).json({
                result: true
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                message: error.message
            });
        }
    }

    // [POST] /cart/student
    addCourseToCart = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_student= req.student.data.id;
            const { id_course } = req.body.data;

            const cart = await Cart.findOne({
                where: {
                    id_user: id_student
                }
            })

            const newRecord = await CartCourse.create({
                id_cart: cart.id,
                id_course
            }, {
                transaction: t
            });

            await t.commit();

            res.status(201).json(newRecord);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });

            await t.rollback();
        }
    }

    // [DELETE] /cart/student
    deleteCourseFromCart = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const id_student = req.student.data.id;
            const { id_course } = req.body.data;

            const cart = await Cart.findOne({
                where: {
                    id_user: id_student
                }
            });

            await CartCourse.destroy({
                where: {
                    id_cart: cart.id,
                    id_course
                },
            }, {
                transaction: t
            });

            res.status(200).json({
                message: "Course has been deleted from cart",
                course: id_course
            });
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });

            await t.rollback();
        }
    }
}


module.exports = new CartController();