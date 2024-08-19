import express from "express";

import {updateTask} from "./controller";

import {check, body} from "express-validator";


const router = express.Router();

// PUT — полное обновление данных.
router.put('/', updateTask);

export default router;
