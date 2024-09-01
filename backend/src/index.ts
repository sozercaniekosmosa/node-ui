// In src/index.js
import express from "express";

import {config} from "dotenv";
import bodyParser from "body-parser";
import apicache from "apicache";
import v1ServiceRouter from "./v1/service/routes";

const env = config();
const app = express();
const cache = apicache.middleware;
export const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(bodyParser.text());
// app.use(express.raw({ type: 'application/octet-stream' }));
// app.use(cache('2 minutes'));
app.use('/api/v1/service', v1ServiceRouter);

app.listen(port, () => {
    console.log(`API is listening on port ${port}`);
});

console.log(env.parsed)