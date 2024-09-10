import express from "express";

import {
    readProjectController, readTaskController, readToolboxController, cmdTaskController, startTaskController, startTasksController,
    stopTasksController, writeProjectController, writeTasksController, addMessageController, isAllowHostPortController
} from "./controller";


const router = express.Router();


// GET — получение данных.
// router.get('/', getProject);
router.get('/toolbox', readToolboxController);
router.get('/project', readProjectController);

// PUT — полное обновление данных.
// router.put('/', updateProject);
router.put('/project', writeProjectController);

router.get('/task/:id', readTaskController);
router.put('/task', writeTasksController);
router.post('/task/:id', startTaskController);
router.post('/task/start', startTasksController);
router.post('/task/stop', stopTasksController);
router.post('/cmd/:id', cmdTaskController);
router.post('/message', addMessageController);
router.get('/host-port/:host/:port/:id', isAllowHostPortController);

export default router;
