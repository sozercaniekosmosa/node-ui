// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";

let task;
const env = config();
const app = express();

const agentPort = process.argv[2];
const id = process.argv[3];

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());

export const debounce = (func, ms) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
};

let a = 0, b = 0;

const update = debounce(() => {
    Object.entries(task.out).forEach(([key, arrHostConsumer]) => {
        (arrHostConsumer as []).forEach(async (host: string) => {
            const [id, inputName] = host.split('.');
            const {ip, port} = task.host[id]
            try {
                const res = await axios.post(`http://${ip}:${port}/in/${inputName}`, {data: a + b})
                console.log(res.data)
            } catch (e) {

            }

            console.log(id, inputName)
        })
    });
}, 1000);

const routerIn = express.Router();
const routerService = express.Router();
routerIn.post('/:name', (req: any, res: any) => {
    const name = req.params.name.toLocaleLowerCase();
    try {
        const {body: {data}} = req

        if (name == 'a') a = data;
        if (name == 'b') b = data;

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
try {
    const res = await axios.get(`http://localhost:${agentPort}/api/v1/service/task/${id}`)
    const {data: {json: data}} = res;

    console.log(data);
    task = data;
    update();
    app.listen(data.port, () => {
        console.log(`Сервис запущен на порте ${data.port}`);
    });
} catch (error) {
    console.log(error);
}


console.log(agentPort)
console.log(id)
// console.log(env.parsed)