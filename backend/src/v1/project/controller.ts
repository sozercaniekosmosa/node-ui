import service from "./service";
import {validationResult} from "express-validator";


export const getProject = (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({status: 'FAILED', data: {error: errors.array()}});
    try {
        const data = service.getProject().toString();
        res.send({status: 'OK', data});
    } catch (error: any) {
        res.status(error.status || 500).send({status: 'FAILED', data: {error: error?.message || error},});
    }
};

export const updateProject = (req: any, res: any) => {

    const {body} = req;
    try {
        const data = service.updateProject(body);
        res.send({status: 'OK', data});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};