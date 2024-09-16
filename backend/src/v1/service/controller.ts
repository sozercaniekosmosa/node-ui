import {validationResult} from "express-validator";
import {killTask, launchTask, launchTasks, readTask, storeTasks, taskCMD} from "./service/task";
import {addMess, isAllowHostPortServ, readProject, readRunning, readToolbox, writeProject} from "./service/general";

export const getReadToolbox = async (req: any, res: any) => {
    try {
        let arrData = await readToolbox();
        res.send(arrData);

    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const getReadProject = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({error: errors.array()});
    try {
        const data = await readProject();
        res.send(data);
    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const putWriteProject = async (req: any, res: any) => {
    const {body: data} = req;
    try {
        await writeProject(data);
        res.send('project written');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const getReadTask = async (req: any, res: any) => {
    const id = req.params.id;
    try {
        let task = await readTask(id);
        res.send(task);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const putWriteTasks = (req: any, res: any) => {
    const {body: tasks} = req;
    try {
        storeTasks(tasks)
        res.send('task written');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
export const postStartTasks = async (req: any, res: any) => {
    try {
        await launchTasks()
        console.log('start')
        res.send('start');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const postStartTask = async (req: any, res: any) => {
    const id = req.params.id
    try {
        let text = await launchTask(id)
        await addMess({type: 'node-log', data: {id, message: text}});
        res.send(text);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const postStopTask = async (req: any, res: any) => {
    const id = req.params.id
    try {
        let text = await killTask({id})
        await addMess({type: 'node-log', data: {id, message: text}});
        res.send(text);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
export const getRunningTasks = async (req: any, res: any) => {
    try {
        const runningList = await readRunning()
        res.send(runningList);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const postCmdTask = async (req: any, res: any) => {
    const {body: cmd} = req;
    const id = req.params.id;
    console.log(cmd)
    try {
        let data = await taskCMD(id, cmd);
        res.send(id + ':' + cmd + ' ' + data);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const postAddMessage = (req: any, res: any) => {
    const {body: message} = req;
    try {
        let text = addMess(message);
        res.send(text);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const getIsAllowHostPort = async (req: any, res: any) => {
    const {host, port, id} = req.params;
    try {
        let isUse = await isAllowHostPortServ(host, port, id);
        res.send(isUse);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
