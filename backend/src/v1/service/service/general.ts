import {config} from "dotenv";
import {debounce, getDataFromArrayPath, getDirectories, readData, throttle, WEBSocket, writeData} from "../../../utils";
import {getStatusTask, killTask} from "./task";
import zlib, {InputType} from "node:zlib"
import * as Buffer from "buffer";

import global from "../../../global"
import axios from "axios";
import {THost, THostPort, TMessage, TRunningList, TStatus, TTaskList} from "../../../../../general/types";
import isLocalhost from "is-localhost-ip";
import {domainToASCII} from "node:url";
import net from "net";

const {parsed: {MAX_MESSAGE_TASK, TIME_MESSAGE_CYCLE}} = config();


export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}

export const getCashFileData = async <T>(path, name, asString = false): Promise<T> => {
    let data;
    try {
        if (global[name]) {
            data = global[name]
        } else {
            const strData = await readData(path, 'utf-8');
            data = asString ? strData : JSON.parse(strData);
            global[name] = data;
        }
    } catch (e) {
        console.log(e)
    }

    return <T>data;
}

let listQueue = {};
export const setCashFileDataWait = throttle(async (list): Promise<void> => {
    let strData: string;
    try {
        for (const {path, name, data, asString = false} of Object.values(list)) {
            global[name] = data;
            strData = asString ? data : JSON.stringify(data, null, 2);
            await writeData(path, strData);
            console.log('файл:' + path, 'сохранен')
        }
        listQueue = {}
    } catch (e) {
        console.log(e)
    }
}, 2000)

export const setCashFileData = async (path, name, data, asString = false): Promise<void> => {
    listQueue[name] = {path, name, data, asString};
    global[name] = data;
    await setCashFileDataWait(<any>listQueue)
};

export const readTasks = async (): Promise<TTaskList> => await getCashFileData('./database/tasks.json', 'tasks')
export const writeTasks = async (tasks): Promise<void> => await setCashFileData('./database/tasks.json', 'tasks', tasks)

export const readHosts = async (): Promise<THost> => await getCashFileData('./database/hosts.json', 'hosts')
export const writeHosts = async (hosts): Promise<void> => await setCashFileData('./database/hosts.json', 'hosts', hosts)

export const readRunning = async (): Promise<TRunningList> => await getCashFileData('./database/running.json', 'running')
export const writeRunning = async (running): Promise<void> => await setCashFileData('./database/running.json', 'running', running)

export const readProject = async (): Promise<string> => await getCashFileData('./database/project.db', 'project', true)
export const writeProject = async (str): Promise<void> => await setCashFileData('./database/project.db', 'project', str, true)

export const readToolbox = async () => {
    let arrDir = await getDirectories('./nodes/');
    let arrPath = arrDir.map(dir => './nodes/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};

export const addMess = async (mess: TMessage) => {
    try {
        if (mess.type == 'node-status') await setStateRunning(mess.data as TStatus);

        (global.messageSocket as WEBSocket).send(mess)
    } catch (e) {
        throw e;
    }

    return `Сообщение добавлено`;
};

export const updateStatesRunningNow = async () => {
    let running: TRunningList = await readRunning() || {};
    let hosts = await readHosts() || {};

    //удаляем все которые не соответствуют настройкам
    for (const [id, {host, port}] of Object.entries(running)) {
        const hp = hosts[id];
        if (!hp || hp.host != host || hp.port != port) {
            await killTask({host, port});
            delete running[id];
        }
    }
    for (const [id, {host, port}] of Object.entries(hosts)) {
        const status = await getStatusTask({host, port});
        if (status.state == 'stop') {
            delete running[id];
        } else { //если не stop значит запущен (run или error)
            running[id] = status;
        }
    }

};

export const updateStatesRunning = debounce(updateStatesRunningNow, 2000)

export const setStateRunning = async (status: TStatus) => {
    let running: TRunningList = await readRunning() ?? {};
    const {id, hostPort, state} = status;

    if (state == "run" || state == "error") {
        running[id] = status;
    }
    if (running?.[id] && state == "stop") {
        delete running[id];
    }

    await updateStatesRunning();


    await writeRunning(running)
}


export const isAllowHostPortServ = async (host, portNode, id = null): Promise<boolean> => {
    try {
        if (id) {
            const hosts = await readHosts();
            const running = await readRunning();
            if (running[id] && hosts[id].host == host && hosts[id].port == portNode) { //если сервис запущен и хост с портом совпадают то true
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
            try { // когда поняли что это не локальный хост запрашиваем данные у агентов извне
                //TODO: global.port - порт заменить на значение порта из карты агентов
                const {data: isAllow} = await axios.get(`http://${host}:${global.port}/api/v1/service/host-port/${host}/${portNode}`)
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