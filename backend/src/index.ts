// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import v1ServiceRouter from "./v1/service/routes";
import global from "./global";
import {WEBSocket} from "./utils";
import {addMess} from "./v1/service/service/general";
import {sendListRan} from "./v1/service/service/task";


const {parsed: {PORT}} = config();
const port = +process.env.PORT || +PORT;

global.port = port
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

    //@ts-ignore
    global.messageSocket = new WEBSocket(webServ, {
        clbAddConnection: async () => {
            try {
                await sendListRan();
                await addMess({type: 'server-init'});
                //TODO: добавить отправку статусов -- run
                // for (const status of Object.values(global.listRunning)) { // не отправляет статусы выключено
                //     await addMess({type: 'node-status', data: status});
                // }
            } catch (e) {
                console.log(e)
            }
        }
    })
// console.log(env.parsed)
}