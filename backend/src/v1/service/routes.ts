import express from "express";

import {getProject, getTask, getToolbox, startTasks, stopTasks, updateProject, updateTasks} from "./controller";


const router = express.Router();


// GET — получение данных.
// router.get('/', getProject);
router.get('/toolbox', getToolbox);
router.get('/project', getProject);

// PUT — полное обновление данных.
// router.put('/', updateProject);
router.put('/project', updateProject);

router.get('/task', getTask);
router.put('/task', updateTasks);
router.post('/task/start', startTasks);
router.post('/task/stop', stopTasks);

export default router;
