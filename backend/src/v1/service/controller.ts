import {getComponents, getTaskData, launchTask, launchTasks, readProject, taskCMD, writeProject, writeTasks} from "./service";
import {validationResult} from "express-validator";

export const getToolbox = async (req: any, res: any) => {
    try {
        let arrData = await getComponents();
        res.send({json: arrData});

    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const getProject = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({error: errors.array()});
    try {
        const data = await readProject();
        res.send({text: data});
    } catch (error: any) {
        res.status(error.status || 500).send({error: error?.message || error},);
    }
};

export const updateProject = async (req: any, res: any) => {
    const {body: data} = req;
    try {
        await writeProject(data);
        res.send({text: 'project written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const getTask = async (req: any, res: any) => {
    const id = req.params.id;
    try {
        let task = await getTaskData(id);
        res.send({json: task});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const updateTasks = (req: any, res: any) => {
    const {body: tasks} = req;
    try {
        writeTasks(tasks)
        res.send({text: 'task written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};
export const startTasks = async (req: any, res: any) => {
    const {body} = req;
    try {
        await launchTasks()
        console.log('start')
        res.send({text: 'start'});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const startTask = async (req: any, res: any) => {
    const id = req.params.id
    try {
        await launchTask(id)
        console.log('start: ' + id)
        res.send({text: 'start: ' + id});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const stopTasks = (req: any, res: any) => {
    const {body} = req;
    try {
        console.log('stop')
        res.send({text: 'stop'});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};

export const nodeCMD = async (req: any, res: any) => {
    const {body: cmd} = req;
    const id = req.params.id;
    try {
        let data = await taskCMD(id, cmd)
        res.send({text: id + ':' + cmd + ' ' + data});
    } catch (error: any) {
        res.status(error?.status || 500).send({error: error?.message || error});
    }
};