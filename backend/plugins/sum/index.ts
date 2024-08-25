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
    const {body} = req
    res.send({status: 'OK', data: 'привет из сервиса'});
    console.log(body)
});
routerIn.post('/b', (req: any, res: any) => {
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