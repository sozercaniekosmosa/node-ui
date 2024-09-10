import express from "express";

import {
    readProject, getTask, getToolbox, cmdTask, startTask, startTasks, stopTasks, updateProject, updateTasks, addMessage,
    isAllowHostPort
} from "./controller";


const router = express.Router();


// GET — получение данных.
// router.get('/', getProject);
router.get('/toolbox', getToolbox);
router.get('/project', readProject);

// PUT — полное обновление данных.
// router.put('/', updateProject);
router.put('/project', updateProject);

router.get('/task/:id', getTask);
router.put('/task', updateTasks);
router.post('/task/:id', startTask);
router.post('/task/start', startTasks);
router.post('/task/stop', stopTasks);
router.post('/cmd/:id', cmdTask);
router.post('/message', addMessage);
router.get('/host-port/:host/:port/:id', isAllowHostPort);

export default router;
