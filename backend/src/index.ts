// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import v1ProjectRouter from "./v1/project/routes";

const env = config();
const app = express();
const cache = apicache.middleware;
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
// app.use(express.raw({ type: 'application/octet-stream' }));
// app.use(cache('2 minutes'));
app.use('/api/v1/project', v1ProjectRouter);

app.listen(PORT, () => {
    console.log(`API is listening on port ${PORT}`);
});

console.log(env.parsed)