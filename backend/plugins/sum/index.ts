// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";


const env = config();
const app = express();

const PORT = process.argv[2] || 3070;

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

let a, b;

function update() {
    if (a && b) {
        axios({
            method: 'post',
            url: '/user/12345',
            data: {
                firstName: 'Fred',
                lastName: 'Flintstone'
            }
        });
    }
}

const routerIn = express.Router();
const routerService = express.Router();
routerIn.post('/a', (req: any, res: any) => {
    try {
        const {body: {data}} = req

        a = data;

        res.send({status: 'OK', data: 'привет из сервиса '+data});
        console.log(data)
        update();
    } catch (e) {

    }
});
routerIn.post('/b', (req: any, res: any) => {
    try {
        const {body: {data}} = req

        b = data;

        res.send({status: 'OK', data: 'привет из сервиса '+data});
        console.log(data)
        update();
    } catch (e) {

    }
});

routerService.post('/kill', (req: any, res: any) => {
    res.send({status: 'OK', data: 'команда на завершение принята'});
    process.exit(0);
});


app.use('/in', routerIn);
app.use('/service', routerService);

app.listen(PORT, () => {
    console.log(`Серввис запущен на порте ${PORT}`);
});

console.log(env.parsed)