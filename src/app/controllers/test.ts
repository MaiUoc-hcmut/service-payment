import { Request, Response, NextFunction } from "express";


class TestController {
    test = async (req: Request, res: Response, _next: NextFunction) => {
        
    }
}


module.exports = new TestController();