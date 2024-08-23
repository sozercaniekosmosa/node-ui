// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import {getToolbox} from "../../src/v1/service/controller";
import axios from "axios";


const env = config();
const app = express();
// const cache = apicache.middleware;
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
// app.use(express.raw({ type: 'application/octet-stream' }));
// app.use(cache('2 minutes'));

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

const router = express.Router();
router.post('/a', (req: any, res: any) => {

});
router.post('/b', (req: any, res: any) => {

});
router.post('/consumers', (req: any, res: any) => {
    const {} = req;
});

app.use('/in', router);

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});

console.log(env.parsed)