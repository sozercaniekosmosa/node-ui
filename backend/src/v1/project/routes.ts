import express from "express";

import {getProject, updateProject} from "./controller";

import {check, body} from "express-validator";


const router = express.Router();


// GET — получение данных.
router.get('/', getProject);

// PUT — полное обновление данных.
router.put('/', updateProject);

export default router;
