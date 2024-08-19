import service from "./service";
import {validationResult} from "express-validator";

export const updateTask = (req: any, res: any) => {

    const {body} = req;
    try {
        const data = service.updateTask(body);
        res.send({status: 'OK', data});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};