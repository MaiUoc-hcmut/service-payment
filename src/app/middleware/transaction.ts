const Transaction = require('../../db/model/transaction');

const createError = require('http-errors');
import { Request, Response, NextFunction } from "express";


class CheckingTransaction {
    checkGetTransactionsOfStudent = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_student = req.params.studentId;
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;

            if (id_user !== id_student && role !== "admin") {
                let error = "You do not have permission to get this information!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetTrantrationsOfTeacher = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_teacher = req.params.teacherId;
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;

            if (id_user !== id_teacher && role !== "admin") {
                let error = "You do not have permission to get this information!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }

    checkGetDetailOfTransaction = async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const id_transaction = req.params.transactionId;
            const id_student = req.params.studentId;
            const id_user = req.user?.user.data.id;
            const role = req.user?.role;

            const transaction = await Transaction.findByPk(id_transaction);
            if (!transaction) {
                let error = "Transaction does not exist!";
                return next(createError.BadRequest(error));
            }

            if (transaction.id_user !== id_student) {
                let error = "This transaction does not belong to this user!"
                return next(createError.Unauthorized(error));
            }

            if (id_user !== id_student && role !== "admin") {
                let error = "You do not have permission to get this information!";
                return next(createError.Unauthorized(error));
            }
            next();
        } catch (error: any) {
            console.log(error.message);
            next(createError.InternalServerError(error.message));
        }
    }
}

module.exports = new CheckingTransaction();