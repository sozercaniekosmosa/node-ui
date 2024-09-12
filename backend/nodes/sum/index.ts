// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import {THost, TLink, TState, TTask, TMessageType, TStatus, TMessage} from "../../../general/types";

interface TInitData {
    task: TTask;
    hosts: THost
}

let a = 0, b = 0;

const env = config();
const app = express();

let status: TStatus = {id: '', hostPort: undefined, state: "stop"};

const agentPort = process.argv[2];
const id = process.argv[3];
const {task, hosts}: TInitData = await getInitData();

const routerIn = express.Router();
const routerService = express.Router();

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
const update = debounce(() => {
    try {
        Object.entries(task.out as TLink).forEach(([key, arrHostConsumer]) => {
            (arrHostConsumer as []).forEach(async (host: string) => {
                const [id, inputName] = host.split('.');
                const {ip, port} = hosts[id]

                const res = await axios.post(`http://${ip}:${port}/in/${inputName}`, {data: a + b})
                console.log(res.data)


                console.log(id, inputName)
            })
        });
    } catch (e) {

    }
}, 1000);
if (task && hosts) update();

async function sendMessage<TMessage>(type, data = null) {
    try {
        const text = await axios.post(`http://localhost:${agentPort}/api/v1/service/message`, {type, data})
        console.log(text)
    } catch (error) {
        console.log(error)
    }
}

async function getInitData(): Promise<TInitData> {
    try {
        const res = await axios.get(`http://localhost:${agentPort}/api/v1/service/task/${id}`)
        const {data: {task, hosts}} = res;

        app.listen(task.hostPort.port, async () => {
            status.state = 'run';
            status.hostPort = task.hostPort;
            status.id = id;
            await sendMessage('node-status', status)
            console.log(`Сервис запущен на порте ${task.hostPort.port}`);
        });

        console.log(task);
        console.log(agentPort)
        console.log(id)

        return {task, hosts} as TInitData;
    } catch (error) {
        console.log(error);
        if (error?.name == 'AxiosError')
            sendMessage('log', `status: ${error.response.status}, message: ${error.message}`);
        sendMessage('log', error);

        process.exit(0); //если при иницализации произошла ошибка то убиваем процесс
    }
}

routerIn.post('/:name', (req: any, res: any) => {
    const name = req.params.name.toLocaleLowerCase();
    try {
        const {body: {data}} = req

        if (name == 'a') a = data;
        if (name == 'b') b = data;

        res.send({status: 'OK', text: 'привет из сервиса ' + data});
        console.log(data)
        update();
    } catch (e) {

    }
});

routerService.post('/kill', async (req: any, res: any) => {
    status.state = 'stop';
    try {
        await sendMessage('node-status', status)
    } catch (e) {
        console.log(e)
    }
    res.send({status: 'OK', text: 'команда на завершение принята'});
    process.exit(0);
});
routerService.post('/cmd', (req: any, res: any) => {
    const cmd = req.params.cmd
    const {body: data} = req;
    console.log(cmd)
    res.send({status: 'OK', text: `команда ${cmd} принята`});
});
routerService.get('/status', async (req: any, res: any) => {
    // await sendMessage('node-status', status)
    res.send(<TStatus>status);
});


app.use('/in', routerIn);
app.use('/service', routerService);

// async function messageLoop() {
//
//     try {
//         await axios.post(`http://localhost:${agentPort}/api/v1/service/message/${id}`, {dest: 'node-status', data: status})
//     } catch (e) {
//         console.log(e)
//     } finally {
//         setTimeout(messageLoop, 2000);
//     }
// }
//
// messageLoop();