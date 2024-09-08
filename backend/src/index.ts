// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import v1ServiceRouter from "./v1/service/routes";
import global from "./global";
import {WEBSocket} from "./utils";
import {addMess, getStatusTask, readData} from "./v1/service/service";
import {TState, TStatus, TTaskList} from "../../general/types";
import axios from "axios";


const {parsed: {PORT}} = config();
const port = +process.env.PORT || +PORT;

global.port = port
createWebServer(global.port);


// createWebSocketServer(webServer);

function createWebServer(port): any | null {
    const app = express();
    const cache = apicache.middleware;

    app.use(bodyParser.json());
    app.use(bodyParser.raw());
    app.use(bodyParser.text());
// app.use(express.raw({ type: 'application/octet-stream' }));
// app.use(cache('2 minutes'));
    app.use('/api/v1/service', v1ServiceRouter);

    const webServ = app.listen(port, () => {
        console.log(`API is listening on port ${port}`);
    });

    global.messageSocket = new WEBSocket(webServ, {
        clbAddConnection: async () => {
            let _id, _hostPort;
            try {
                const strTasks = (await readData('database/tasks.json', 'utf-8')).toString();
                const taskList = JSON.parse(strTasks) as TTaskList
                for (const {hostPort, id} of Object.values(taskList)) {
                    _hostPort = hostPort;
                    const {host, port: portNode} = hostPort;
                    _id = id;
                    let status = await getStatusTask({host, port: portNode, id})
                    addMess({type: 'node-status', data: status});
                }
            } catch (e) {
                console.log(e)
            }
        }
    })
// console.log(env.parsed)
}

