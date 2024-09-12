// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import v1ServiceRouter from "./v1/service/routes";
import global from "./global";
import {readData, WEBSocket} from "./utils";
import {TTaskList} from "../../general/types";
import {requestStatusTask} from "./v1/service/service/task";
import {addMess, readRunning, readTasks, updateStatesRunningNow} from "./v1/service/service/general";


const {parsed: {PORT}} = config();
const port = +process.env.PORT || +PORT;

global.port = port
await updateStatesRunningNow();

createWebServer(global.port);


// createWebSocketServer(webServer);

function createWebServer(port): any | null {
    const app = express();
    const cache = apicache.middleware;

    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.raw());
    app.use(bodyParser.text({limit: '50mb'}));
// app.use(express.raw({ type: 'application/octet-stream' }));
// app.use(cache('2 minutes'));
    app.use('/api/v1/service', v1ServiceRouter);

    const webServ = app.listen(port, () => {
        console.log(`API is listening on port ${port}`);
    });

    global.messageSocket = new WEBSocket(webServ, {
        clbAddConnection: async () => {
            try {
                const runningList = await readRunning();
                for (const status of Object.values(runningList)) { // не отправляет статусы выключено
                    addMess({type: 'node-status', data: status});
                }
            } catch (e) {
                console.log(e)
            }
        }
    })
// console.log(env.parsed)
}

