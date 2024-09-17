// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import axios from "axios";
import {TInitData, TLink, TStatus} from "../../../general/types";

const app = express();


let status: TStatus = {id: '', hostPort: undefined, state: "stop"};

const agentPort = process.argv[2];
const id = process.argv[3];
const {task, hosts}: TInitData = await getInitData();

const router = express.Router();

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
const evaluation = (codeEditor, val) => {
    try {
        const fn = eval(codeEditor.code)
        return fn(val)
    } catch (e) {
        console.log(e)
    }
}

const update = (input) => {
    const data = evaluation(task.cfg[0][1], input);
    try {
        Object.entries(task.out as TLink).forEach(([key, arrHostConsumer]) => {
            (arrHostConsumer as []).forEach(async (path: string) => {
                const [id, inputName] = path.split('.');
                const {host, port} = hosts[id];
                try {
                    const res = await axios.post(`http://${host}:${port}/in/${inputName}`, {data})
                    console.log(res.data)
                    console.log(id, inputName)
                } catch (e) {
                    console.log(e)
                }
            })
        });
    } catch (e) {
        console.log(e)
    }
};

async function sendMessage<TMessage>(type, data = null) {
    try {
        const text = await axios.post(`http://localhost:${agentPort}/api/v1/service/message`, {type, data})
        // console.log(text)
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

router.post('in/:name', (req: any, res: any) => {
    const name = req.params.name.toLocaleLowerCase();
    try {
        const {body: {data}} = req


        if (name == 'in')
            update(data);

        res.send({status: 'OK', text: 'привет из сервиса ' + data});
        // console.log(data)
    } catch (e) {

    }
});
router.post('/kill', async (req: any, res: any) => {
    status.state = 'stop';
    try {
        await sendMessage('node-status', status)
    } catch (e) {
        console.log(e)
    }
    res.send({status: 'OK', text: 'команда на завершение принята'});
    process.exit(0);
});
router.post('/cmd/:cmd', (req: any, res: any) => {
    const cmd = req.params.cmd
    const {body: data} = req;
    try {

        console.log(cmd)
        update(null)
        res.send(`команда ${cmd} принята`);
    } catch (e) {
        console.log(e)
    }
});
router.get('/status', async (req: any, res: any) => {
    // await sendMessage('node-status', status)
    res.send(<TStatus>status);
});
app.use('/', router);


let exitTimeoutId: NodeJS.Timeout;
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => process.on(eventType, killProcess))

async function killProcess() {
    if (exitTimeoutId) return;
    exitTimeoutId = setTimeout(() => process.exit(0), 2000);
    status.state = 'stop';
    await sendMessage('node-status', status)
}

process.stdin.resume();