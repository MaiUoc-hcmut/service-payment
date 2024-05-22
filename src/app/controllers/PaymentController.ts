const Cart = require('../../db/model/cart');
const Transaction = require('../../db/model/transaction');
const CartCourse = require('../../db/model/cart-course');
const TransactionCourse = require('../../db/model/transaction-course');

import { Request, Response, NextFunction } from "express";

const { sequelize } = require('../../config/db/index');
const axios = require('axios');

declare global {
    namespace Express {
        interface Request {
            teacher?: any;
            student?: any;
        }
    }
}

class PaymentController {

    // [GET] /payment/transactions/:studentId
    getTransactionsOfStudent = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_user = req.params.studentId;

            const transactions = await Transaction.findAll({
                where: { id_user }
            });

            res.status(200).json(transactions);

        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [GET] /payment/transactions/teacher/:teacherId/page/:page
    getTransactionOfTeacher = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            
            const currentPage: number = +req.params.page;
            const pageSize: number = 20;

            const transactions = await TransactionCourse.findAll({
                where: {
                    id_teacher
                },
                limit: pageSize,
                offset: pageSize * (currentPage - 1)
            });

            res.status(200).json(transactions);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [GET] /payment/transactions/:studentId/:transactionId
    getDetailOfTransaction = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            const id_transaction = req.params.transactionId;

            const transaction = await Transaction.findOne({
                where: { id: id_transaction },
                include: [
                    {
                        model: TransactionCourse,
                        as: 'courses'
                    }
                ]
            });

            let courseList = [];

            for (const record of transaction.courses) {
                const id_course = record.id_course;
                const course = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${id_course}`);
                courseList.push(course);
            }

            delete transaction.dataValues.courses;
            transaction.dataValues.courses = courseList;

            res.status(200).json(transaction);
        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            });
        }
    }

    // [POST] /payment/pay
    payByScanQRCode = async (req: Request, res: Response, _next: NextFunction) => {
        try {
            let response = "";

            //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
            //parameters
            var partnerCode = "MOMO";
            var accessKey = "F8BBA842ECF85";
            var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
            var requestId = partnerCode + new Date().getTime();
            var orderId = requestId;
            var orderInfo = req.body.orderInfo;
            var redirectUrl = "http://localhost:3000/payment/result";
            var ipnUrl = "https://eoidnudnipocu1q.m.pipedream.net/";
            var amount = req.body.amount;
            var requestType = "captureWallet"
            var extraData = ''; //pass empty value if your merchant does not have stores

            //before sign HMAC SHA256 with format
            //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
            var rawSignature =
                "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + ipnUrl +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + partnerCode +
                "&redirectUrl=" + redirectUrl +
                "&requestId=" + requestId +
                "&requestType=" + requestType
            //puts raw signature
            console.log("--------------------RAW SIGNATURE----------------")
            console.log(rawSignature)
            //signature
            const crypto = require('crypto');
            var signature = crypto.createHmac('sha256', secretkey)
                .update(rawSignature)
                .digest('hex');
            console.log("--------------------SIGNATURE----------------")
            console.log(signature)

            //json object send to MoMo endpoint
            const requestBody = JSON.stringify({
                partnerCode: partnerCode,
                accessKey: accessKey,
                requestId: requestId,
                amount: amount,
                orderId: orderId,
                orderInfo: orderInfo,
                redirectUrl: redirectUrl,
                ipnUrl: ipnUrl,
                extraData: extraData,
                requestType: requestType,
                signature: signature,
                lang: 'en'
            });
            //Create the HTTPS objects
            const https = require('https');
            const options = {
                hostname: 'test-payment.momo.vn',
                port: 443,
                path: '/v2/gateway/api/create',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody)
                }
            }
            //Send the request and get the response
            const reqq = https.request(options, (ress: any) => {
                console.log(`Status: ${ress.statusCode}`);
                console.log(`Headers: ${JSON.stringify(ress.headers)}`);
                ress.setEncoding('utf8');
                ress.on('data', (body: any) => {
                    console.log('Body: ');
                    console.log(body);
                    console.log('payUrl: ');
                    console.log(JSON.parse(body).payUrl);

                    response = JSON.parse(body);
                });
                ress.on('end', () => {
                    console.log('No more data in response.');
                    res.status(200).json(response);
                });
            })

            reqq.on('error', (e: any) => {
                console.log(`problem with request: ${e.message}`);
            });
            // write data to request body
            console.log("Sending....")
            reqq.write(requestBody);
            reqq.end();

        } catch (error: any) {
            console.log(error.message);
            res.status(500).json({
                error,
                message: error.message
            })
        }
    }

    // [POST] /payment/receive-ipn 
    receiveInstantPaymentNotification = async (req: Request, res: Response, _next: NextFunction) => {
        const t = await sequelize.transaction();
        try {
            const body = req.body.data;
            const id_user = req.student?.data.id;

            const cart = await Cart.findOne({
                where: { id_user }
            });

            const transaction = await Transaction.create({
                id_user,
                ...body
            }, {
                transaction: t
            });

            const cartCourses = await CartCourse.findAll({
                where: {
                    id_cart: cart.id
                }
            });

            const dataCourses: any[] = [];
            const dataCombos: any[] = [];
            const courses: string[] = [];

            for (const record of cartCourses) {
                if (record.id_course) {
                    console.log(record.id_course, 240);
                    const course = await axios.get(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${record.id_course}`);

                    let price = course.data.price;
                    let percentDiscount = 0;
                    const today = new Date();
                    for (const coupon of course.data.Coupons) {
                        if (
                            today.getTime() > coupon.start_time.getTime() 
                            && today.getTime() < coupon.expire.getTime()
                        ) {
                            percentDiscount += coupon.percent;
                        }
                    }
                    price = price * (1 - percentDiscount / 100);

                    dataCourses.push({
                        id_course: course.data.id,
                        id_transaction: transaction.id,
                        id_teacher: course.data.id_teacher,
                        price
                    });

                    courses.push(record.id_course);
                } else if (record.id_combo_exam) {

                }
            }

            const dataToCreate = [...dataCombos, ...dataCourses];

            await TransactionCourse.bulkCreate(dataToCreate, { transaction: t });

            if (body.message === 'Successful.' || body.message === 'successful.') {
                await CartCourse.destroy({
                    where: { id_cart: cart.id }
                }, {
                    transaction: t
                });

                const data = {
                    id_student: id_user
                }

                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization
                }

                for (const course of courses) {
                    const response = await axios.post(`${process.env.BASE_URL_COURSE_LOCAL}/courses/${course}`, data, { headers });
                }
            }

            await t.commit();

            res.status(200).json(transaction);
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

module.exports = new PaymentController();