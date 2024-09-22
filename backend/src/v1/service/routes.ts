import express from "express";

import {
    getIsAllowHostPort, getReadProject, getReadTask, getReadToolbox, getRunningTasks, postAddMessage, postCmdTask, postStartTask,
    postStartTasks, postStopTask, postStopTasks, putWriteProject, putWriteTasks
} from "./controller";

const router = express.Router();


// GET — получение данных.
// PUT — полное обновление данных.
router.get('/toolbox', getReadToolbox);

router.get('/project', getReadProject);
router.put('/project', putWriteProject);

router.get('/running', getRunningTasks);
router.get('/task/:id', getReadTask);
router.put('/task', putWriteTasks);
router.post('/task/start', postStartTasks);
router.post('/task/stop', postStopTasks);
router.post('/task/start/:id', postStartTask);
router.post('/task/stop/:id', postStopTask);
router.post('/cmd/:id', postCmdTask);
router.post('/message', postAddMessage);
router.get('/host-port/:host/:port/:id', getIsAllowHostPort);

export default router;
