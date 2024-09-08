import {
    addMess, getAllMess, getComponents, getTaskData, launchTask, launchTasks, readProject, taskCMD, writeProject, writeTasks,
    isAllowHostPortServ
} from "./service";
import {validationResult} from "express-validator";

export const getToolbox = async (req: any, res: any) => {
    try {
        let arrData = await getComponents();
        res.send(arrData);

    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const getProject = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({error: errors.array()});
    try {
        const data = await readProject();
        res.send(data);
    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const updateProject = async (req: any, res: any) => {
    const {body: data} = req;
    try {
        await writeProject(data);
        res.send('project written');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const getTask = async (req: any, res: any) => {
    const id = req.params.id;
    try {
        let task = await getTaskData(id);
        res.send(task);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const updateTasks = (req: any, res: any) => {
    const {body: tasks} = req;
    try {
        writeTasks(tasks)
        res.send('task written');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
export const startTasks = async (req: any, res: any) => {
    try {
        await launchTasks()
        console.log('start')
        res.send('start');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const startTask = async (req: any, res: any) => {
    const id = req.params.id
    try {
        let text = await launchTask(id)
        console.log(text)
        res.send({text});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const stopTasks = (req: any, res: any) => {
    try {
        console.log('stop')
        res.send('stop');
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const cmdTask = async (req: any, res: any) => {
    const {body: cmd, data} = req;
    const id = req.params.id;
    try {
        let data = await taskCMD(id, cmd, data);
        res.send(id + ':' + cmd + ' ' + data);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const addMessage = (req: any, res: any) => {
    const {body: message} = req;
    try {
        let text = addMess(message);
        res.send(text);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const isAllowHostPort = async (req: any, res: any) => {
    const {host, port, id} = req.params;
    try {
        let isUse = await isAllowHostPortServ(host, port, id);
        res.send(isUse);
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
