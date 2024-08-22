import express from "express";

import {getProject, getToolbox, startTask, stopTask, updateProject, updateTask} from "./controller";


const router = express.Router();


// GET — получение данных.
// router.get('/', getProject);
router.get('/toolbox', getToolbox);
router.get('/project', getProject);

// PUT — полное обновление данных.
// router.put('/', updateProject);
router.put('/project', updateProject);
router.put('/task', updateTask);
router.post('/task/start', startTask);
router.post('/task/stop', stopTask);

export default router;
