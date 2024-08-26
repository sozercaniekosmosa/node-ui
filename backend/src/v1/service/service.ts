import {getDataFromArrayPath, getDirectories, readFileAsync, writeFileAsync} from "../../utils";
import zlib, {InputType} from "node:zlib"
import {resolve} from "path";
import * as Buffer from "buffer";
import {spawn} from "child_process";


type TTypeName = string;
type TValue = any;
type TName = string;
type TConfig = [TName, TValue, TTypeName];

type TPath = string;

interface TLink {
    [key: string]: TPath[];
}

interface TTask {
    nodeName: string;
    id: string,
    cfg: TConfig[];
    in?: TLink;
    out?: TLink;
}

export interface TTaskList {
    [key: string]: TTask
}


const pathRoot = process.cwd();

const pathResolveRoot = (path: string) => resolve(pathRoot, ...path.split(/\\|\//));


export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}

export const readData = async (path: string, options?): Promise<any> => {
    try {
        const data = await readFileAsync(path, options);
        return data;
    } catch (error) {
        throw error;
    }
};

export const writeData = (path: string, data: any): any => {
    try {
        writeFileAsync(pathResolveRoot(path), data);
    } catch (error) {
        throw error;
    }
};

export const writeTasks = (tasks: TTaskList): any => {
    try {
        const strTask = JSON.stringify(tasks, null, 2);
        writeFileAsync(pathResolveRoot('./database/tasks.json'), strTask);

        let mapNodes = {}
        let arrTask = Object.values(tasks);
        arrTask.forEach(({id, ip, port}) => mapNodes[id] = {ip, port})
        const strMapNodes = JSON.stringify(mapNodes, null, 2);
        writeFileAsync(pathResolveRoot('./database/hosts.json'), strMapNodes);
    } catch (error) {
        throw error;
    }
};

export const getComponents = async () => {
    let arrDir = await getDirectories('./plugins/');
    // writeFileAsync(pathResolveRoot('./database/dirNamesPlugins.json'), JSON.stringify(arrDir))
    let arrPath = arrDir.map(dir => './plugins/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};

export async function readProject() {
    const data = (await readData('database/project.db', 'utf-8')).toString();
    return data;
}

export function writeProject(data) {
    writeData('database/project.db', data);
}

export async function launchTasks() {
    const strTasks = (await readData('database/tasks.json', 'utf-8')).toString();
    const taskList = JSON.parse(strTasks) as TTaskList
    Object.values(taskList).forEach(({id, nodeName, cfg, in: input, out}) => {

    })

    let port = '3021';
    let path = pathResolveRoot('./plugins/sum/launch.bat')
    const child = spawn('start', ['/B', path, port], {
        cwd: './plugins/sum',
        shell: true,
        // detached: true,     // Открепляет процесс
        stdio: 'ignore'     // Игнорирует стандартные потоки ввода/вывода
    });
    child.unref();

    return;
}

export const getTaskData = async (id: string) => {
    const strTasks = await readData('./database/tasks.json', 'utf-8');
    const tasks = JSON.parse(strTasks);
    const strHosts = await readData('./database/hosts.json', 'utf-8');
    const hosts = JSON.parse(strHosts);

    let task = tasks[id]
    task.host = hosts;

    return task;
};