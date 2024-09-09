import {config} from "dotenv";
import {debounce, getDataFromArrayPath, getDirectories, readFileAsync, WEBSocket, writeFileAsync} from "../../utils";
import zlib, {InputType} from "node:zlib"
import {resolve} from "path";
import * as Buffer from "buffer";
import {spawn} from "child_process";

import global from "../../global"
import axios from "axios";
import {THost, THostPort, TMessage, TStatus, TTaskList} from "../../../../general/types";
import isLocalhost from "is-localhost-ip";
import {domainToASCII} from "node:url";
import net from "net";


const pathRoot = process.cwd();
const {parsed: {MAX_MESSAGE_TASK, TIME_MESSAGE_CYCLE}} = config();

const pathResolveRoot = (path: string) => resolve(pathRoot, ...path.split(/\\|\//));


export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}

const getHosts = async (): Promise<THost> => {
    let hosts;
    try {
        const strHosts = await readData('./database/hosts.json', 'utf-8');
        hosts = JSON.parse(strHosts);
    } catch (e) {
        console.log(e)
    }

    return hosts;
}
const getTasks = async (): Promise<TTaskList> => {
    let tasks;
    try {
        const strTasks = await readData('./database/tasks.json', 'utf-8');
        tasks = JSON.parse(strTasks);
    } catch (e) {
        console.log(e)
    }

    return tasks;
}
const getListRun = async (): Promise<THost> => {
    let listRun: THost;

    try {
        const strListRun = (await readData('database/running.json', 'utf-8')).toString();
        listRun = JSON.parse(strListRun);
    } catch (e) {
        console.log('Файл: "Список запущенных задач" еще не создан')
    }

    return listRun;
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

export const killTask = async ({id = null, host = null, port = null}): any => {
    try {
        if (id) {
            const hosts = getHosts();
            host = hosts[id].host;
            port = hosts[id].port;
        }

        await axios.post(`http://${host}:${port}/service/kill`)
        console.warn(`Процессу (${host}:${port}) отправлена команда на завершение`)
    } catch (e) {
        console.warn(`Процесс (${host}:${port}) не ответил на команду завершения, возможно не был запущен`)
    }
}

export const writeTasks = async (tasks: TTaskList): any => {
    let oldHosts = await getHosts();

    try {
        let newHosts = {}
        let arrTask = Object.values(tasks);
        arrTask.forEach(({id, hostPort: {host, port}}) => newHosts[id] = {host, port})

        if (oldHosts) {//если есть старые хосты
            for (const [oldID, hostPort] of Object.entries(oldHosts)) {//перебераем все старые
                const newHost = newHosts[oldID];
                if (!newHost || newHost.host != hostPort.host || newHost.port != hostPort.port) { //если среди новых нет старого ID прибиваем процесс по строму ID
                    killTask(hostPort)
                }
            }
        }

        const strMapNodes = JSON.stringify(newHosts, null, 2);
        const strTask = JSON.stringify(tasks, null, 2);

        await writeData('./database/tasks.json', strTask);
        await writeData('./database/hosts.json', strMapNodes);
    } catch (error) {
        throw error;
    }
};

export const getComponents = async () => {
    let arrDir = await getDirectories('./nodes/');
    // writeFileAsync(pathResolveRoot('./database/dirNamesPlugins.json'), JSON.stringify(arrDir))
    let arrPath = arrDir.map(dir => './nodes/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};

export async function readProject() {
    const data = (await readData('database/project.db', 'utf-8')).toString();
    return data;
}

export function writeProject(data) {
    writeData('./database/project.db', data);
}

export async function launchTasks() {
    const taskList: TTaskList = await getTasks();
    Object.values(taskList).forEach(({id, nodeName, cfg, in: input, out}) => {

    })
    return;
}

export async function getStatusTask({id = null, host = null, port = null}): Promise<TStatus> {
    try {
        if (id && !(host || port)) {
            const hosts = getHosts();
            host = hosts[id].host;
            port = hosts[id].port;
        }

        const status: TStatus = await axios.get(`http://${host}:${port}/service/cmd/status`);
        return status;
    } catch (e) {
        return <TStatus>{state: 'stop', hostPort: {host, port}, id}
    }
}

export async function launchTask(id) {
    const taskList: TTaskList = await getTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port: portNode}} = taskList[id];

    let path = pathResolveRoot(`./nodes/${nodeName}/launch.bat`)


    let {state} = await getStatusTask({host, port: portNode});
    if (state == 'run') {
        return `Сервис ${id} уже запущен`
    } else {
        //если сервис еще не запущен
        try {
            if (await isAllowHostPortServ(host, portNode)) {
                const child = spawn('start', ['/B', path, global.port, id], { //запускаем
                    cwd: './nodes/sum',
                    shell: true,
                    // detached: true,  // Открепляет процесс
                    stdio: 'ignore'     // Игнорирует стандартные потоки ввода/вывода
                });
                child.unref();
                console.log(child)
                return `Команда на запуск сервиса ${id} принята`;
            } else {
                await addMess(<TMessage>{
                    type: 'log',
                    data: `Сервис:${id} запустить не удалось ${host}:${portNode} заняты`
                })
            }
        } catch (e) {
            console.log(e)
            throw {status: 500, message: `Сервис ${id} запустить не удалось`};
        }
    }
}

export async function taskCMD(id, cmd, data) {
    const taskList: TTaskList = await getTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port: portNode}} = taskList[id];

    try {
        const res = await axios.post(`http://${host}:${portNode}/service/cmd/${cmd}`, {data})
        console.log(res.data)
        return res.data.text;
    } catch (error) {
        if (error?.name == 'AxiosError') throw {status: error.response.status, message: error.message};
        throw error;
    }

}

export const getTaskData = async (id: string) => {
    const tasks: TTaskList = await getTasks();
    const hosts = await getHosts();

    let task = tasks[id]

    return {task, hosts};
};

export const addMess = async (mess: TMessage) => {
    try {
        if (mess.type == 'node-status') await updateListRunning(mess.data as TStatus);

        (global.messageSocket as WEBSocket).send(mess)
    } catch (e) {
        throw e;
    }

    return `Сообщение добавлено`;
};

const clearListRunningNow = async () => {
    let listRun: THost = await getListRun() || {};
    let hosts = await getHosts() || {};

    for (const [idr, {host, port}] of Object.entries(listRun)) {
        const hp = hosts[idr];
        if (!hp || hp.host != host || hp.port != port) {
            await killTask({host, port})
            delete listRun[idr];
        }
    }
    for (const [idr, {host, port}] of Object.entries(listRun)) {
        const {state} = await getStatusTask({host, port});
        if (state == 'stop') {
            delete listRun[idr];
        }
    }

};

export const clearListRunning = debounce(clearListRunningNow, 2000)

export const updateListRunning = async ({id, hostPort, state}: TStatus) => {
    let listRun: THost = await getListRun() ?? {};

    if (state == "run" || state == "error") {
        listRun[id] = <THostPort>hostPort;
    }
    if (listRun?.[id] && state == "stop") {
        delete listRun[id];
    }

    await clearListRunning();


    const strListRun = JSON.stringify(listRun);
    writeData('./database/running.json', strListRun);
}


export const isAllowHostPortServ = async (host, portNode, id = null): Promise<boolean> => {
    try {
        if (id) {
            const hosts = await getHosts();
            const listRun = await getListRun();
            if (listRun[id] && hosts[id].host == host && hosts[id].port == portNode) { //если сервис запущен и хост с портом совпадают то true
                return new Promise<boolean>(r => r(true))
            }
        }

        const isLocal = await isLocalhost(domainToASCII(host), true);
        if (isLocal) {
            return new Promise<boolean>((resolve) => {

                const server = net.createServer();

                server.once('error', function (err) {
                    if (err.code === 'EADDRINUSE') {
                        resolve(false)
                    }
                });

                server.once('listening', function () {
                    server.close();
                    resolve(true)
                });

                server.listen(portNode);
            });
        } else {
            try {
                //TODO: 3000 - порт заменить на значение порта из карты агентов
                const {data: isAllow} = await axios.get(`http://${host}:3000/api/v1/service/host-port/${host}/${portNode}`)
                return isAllow;
            } catch (e) {
                return false;
            }
        }

    } catch (error) {
        if (error?.name == 'AxiosError') throw {status: error.response.status, message: error.message};
        throw error;
    }
};