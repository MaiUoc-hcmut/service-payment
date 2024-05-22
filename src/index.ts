const express = require('express');
const cors = require('cors');
const createError = require('http-errors');
const bodyParser = require('body-parser');
const http = require('http');
const route = require('./routes');

require('dotenv').config()


const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

route(app);

const server = http.createServer(app);

server.listen(4004, () => {
    console.log("Server is running on port 4004");
});

export {}