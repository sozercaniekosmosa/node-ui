// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

let cfg;
const env = config();
const app = express();

const id = process.argv[2];

const PORT = 3070;

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

        res.send({status: 'OK', data: 'привет из сервиса ' + data});
        console.log(data)
        update();
    } catch (e) {

    }
});
routerIn.post('/b', (req: any, res: any) => {
    try {
        const {body: {data}} = req

        b = data;

        res.send({status: 'OK', data: 'привет из сервиса ' + data});
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

axios.get('http://localhost:3000/api/v1/service/task', {params: {id}}
).then(function (res) {
    const {data: {data}} = res;
    cfg = data;
    console.log(data);
    app.listen(cfg.port, () => {
        console.log(`Сервис запущен на порте ${cfg.port}`);
    });
}).catch(function (error) {
    console.log(error);
});

console.log(env.parsed)