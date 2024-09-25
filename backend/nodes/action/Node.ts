import express from "express";
import bodyParser from "body-parser";
import {TCallback, TInitData, TLink} from "../../../general/types";
import axios from "axios";

export default async (callback: TCallback) => {

    const app = express();
    const router = express.Router();

    const agentPort = process.argv[2];
    const id = process.argv[3];
    const {task, hosts}: TInitData = await getInitData();
    const debug = task.cfg?.debug?.[0] ?? true;

    let inputData = {};

    app.use(bodyParser.json());
    app.use(bodyParser.raw());
    app.use(bodyParser.text());

    router.post('/in/:name', async (req: any, res: any) => {
        const name = req.params.name.toLocaleLowerCase();
        try {
            const {body: {data}} = req
            inputData[name] = data;
            debug && await sendMessage('node-log-input', {id, name, data});
            const resData = callback(task, inputData);
            debug && await sendMessage('node-log-output', {id, data});
            sendData(resData);
            res.send({status: 'OK'});
            // console.log(data)
        } catch (e) {

        }
    });
    router.post('/cmd/:cmd', async (req: any, res: any) => {
        const cmd = req.params.cmd
        const {body: data} = req;
        try {
            // console.log(cmd)
            const data = await callback(task, null);
            debug && await sendMessage('node-log-output', {id, data});
            sendData(data);
            res.send(`команда ${cmd} принята`);
        } catch (e) {
            // console.log(e)
        }
    });

    app.use('/', router);

    function sendData(data) {
        Object.entries(task.out as TLink).forEach(([key, arrHostConsumer]) => {
            (arrHostConsumer as []).forEach(async (path: string) => {
                const [id, inputName] = path.split('.');
                const {host, port} = hosts[id];
                try {
                    const res = await axios.post(`http://${host}:${port}/in/${inputName}`, {data})
                    // console.log(res.data)
                    // console.log(id, inputName)
                } catch (error) {
                    if (error?.name == 'AxiosError') {
                        await sendMessage('node-log-error', `status: ${error.response.status}, message: ${error.message}`);
                        console.log('node-log-error', `status: ${error.response.status}, message: ${error.message}`)
                    }
                    if (error?.name == 'AggregateError') {
                        await sendMessage('node-log-error', `status: ${error.code}, message: ${error.errors.map(({message}) => message)}`);
                        console.log('node-log-error', `status: ${error.code}, message: ${error.errors.map(({message}) => message)}`)
                    }
                }
            })
        });
    }

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
            // console.log(task.cfg)

            app.listen(task.hostPort.port, async () => {
                console.log(`Сервис запущен на порте ${task.hostPort.port}`);
            });

            return {task, hosts} as TInitData;
        } catch (error) {
            console.log(error);
            if (error?.name == 'AxiosError')
                await sendMessage('log', `status: ${error.response.status}, message: ${error.message}`);
            await sendMessage('log', error);

            process.exit(0); //если при иницализации произошла ошибка то убиваем процесс
        }
    }

    return {
        sendMessage
    }
}