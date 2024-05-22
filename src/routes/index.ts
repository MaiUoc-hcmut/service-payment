const testRouter = require('./test');
const paymentRouter = require('./payment');
const cartRouter = require('./cart');

function route(app: any) {
    app.use('/api/v1/test', testRouter);
    app.use('/api/v1/payment', paymentRouter);
    app.use('/api/v1/cart', cartRouter);
}

module.exports = route;