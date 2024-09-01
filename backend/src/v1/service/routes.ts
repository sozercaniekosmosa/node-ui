import express from "express";

import {getProject, getTask, getToolbox, nodeCMD, startTask, startTasks, stopTasks, updateProject, updateTasks} from "./controller";


const router = express.Router();


// GET — получение данных.
// router.get('/', getProject);
router.get('/toolbox', getToolbox);
router.get('/project', getProject);

// PUT — полное обновление данных.
// router.put('/', updateProject);
router.put('/project', updateProject);

router.get('/task/:id', getTask);
router.put('/task', updateTasks);
router.post('/task/:id', startTask);
router.post('/task/start', startTasks);
router.post('/task/stop', stopTasks);
router.post('/cmd/:id', nodeCMD);

export default router;
