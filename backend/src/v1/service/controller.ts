import {decompressGzip, getDataFromArrayPath, getDirectories, readData, writeData} from "./service";
import {validationResult} from "express-validator";
import sanitizeHtml from 'sanitize-html';

export const getToolbox = async (req: any, res: any) => {
    // const {params: {id},} = req;
    try {

        let arrDir = (await getDirectories('./plugins/'))
        let arrPath = arrDir.map(dir => './plugins/' + dir + '/cfg.json')
        let arrFile = (await getDataFromArrayPath(arrPath))
        let arrData = arrFile.map((file, i) => {
            const cfg = JSON.parse(file.content);
            cfg.nodeName = arrDir[i];
            return cfg;
        })

        // const data = readData('../nodes/node.js').toString();
        // const data = readData('../nodes/dist/nodes.umd.js').toString();
        res && res.send({status: 'OK', data: arrData});

    } catch (error: any) {
        res.status(error.status || 500).send({status: 'FAILED', data: {error: error?.message || error},});
    }
};
// getToolbox(null, null);

export const getProject = (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.status(400).send({status: 'FAILED', data: {error: errors.array()}});
    try {
        const data = readData('database/project.db').toString();
        res.send({status: 'OK', data});
    } catch (error: any) {
        res.status(error.status || 500).send({status: 'FAILED', data: {error: error?.message || error},});
    }
};

export const updateProject = async (req: any, res: any) => {
    const {body: data} = req;
    try {
        // debugger
        // var buf: Buffer = Buffer.from(body, 'utf8');
        // let html: string = (<Buffer>await decompressGzip(buf)).toString();
        // let htmlSan = sanitizeHtml(html.toString(), {allowedTags: ['svg', 'g', 'defs', 'linearGradient', 'stop', 'circle'], allowedAttributes: false})
        writeData('database/project.db', data);
        res.send({status: 'OK', data: 'project written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};

export const updateTask = (req: any, res: any) => {
    const {body} = req;
    try {
        writeData('database/task.json', JSON.stringify(body, null, 2));
        res.send({status: 'OK', data: 'task written'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};
export const startTask = (req: any, res: any) => {
    const {body} = req;
    try {
        console.log('start')
        res.send({status: 'OK', data: 'start'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};

export const stopTask = (req: any, res: any) => {
    const {body} = req;
    try {
        console.log('stop')
        res.send({status: 'OK', data: 'stop'});
    } catch (error: any) {
        res.status(error?.status || 500).send({status: 'FAILED', data: {error: error?.message || error}});
    }
};