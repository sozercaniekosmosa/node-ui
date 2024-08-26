import {getComponents, getTaskData, launchTasks, readProject, writeProject, writeTasks} from "./service";
import {validationResult} from "express-validator";

export const getToolbox = async (req: any, res: any) => {
    try {
        let arrData = await getComponents();
        res.send({status: 'OK', data: arrData});

    } catch (error: any) {
        res.status(error.status || 500).send({status: 'FAILED', data: {error: error?.message || error},});
    }
};

export const getProject = async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({status: 'FAILED', data: {error: errors.array()}});
    try {
        const data = await readProject();
        res.send({status: 'OK', data});
    } catch (error: any) {
        res.status(error.status || 500).send({status: 'FAILED', data: {error: error?.message || error},});
    }
};

export const updateProject = async (req: any, res: any) => {
    const {body: data} = req;
    try {
        await writeProject(data);
        res.send({status: 'OK', data: 'project written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};

export const getTask = async (req: any, res: any) => {
    const {query: {id}} = req;
    try {
        let data = await getTaskData(id);
        res.send({status: 'OK', data: data});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};

export const updateTasks = (req: any, res: any) => {
    const {body: tasks} = req;
    try {
        writeTasks(tasks)
        res.send({status: 'OK', data: 'task written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};
export const startTasks = async (req: any, res: any) => {
    const {body} = req;
    try {
        await launchTasks()
        console.log('start')
        res.send({status: 'OK', data: 'start'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};

export const stopTasks = (req: any, res: any) => {
    const {body} = req;
    try {
        console.log('stop')
        res.send({status: 'OK', data: 'stop'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};