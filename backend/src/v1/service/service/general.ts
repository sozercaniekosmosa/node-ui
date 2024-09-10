import {config} from "dotenv";
import {debounce, getDataFromArrayPath, getDirectories, readData, throttle, WEBSocket, writeData} from "../../../utils";
import {getStatusTask, killTask} from "./task";
import zlib, {InputType} from "node:zlib"
import * as Buffer from "buffer";

import global from "../../../global"
import axios from "axios";
import {THost, THostPort, TMessage, TStatus, TTaskList} from "../../../../../general/types";
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

export const setCashFileDataNow = async (path, name, data, asString = false): Promise<void> => {
    let strData: string;
    try {
        global[name] = data;
        strData = asString ? data : JSON.stringify(data, null, 2);
        await writeData(path, strData);
        console.log('файл:' + path, 'сохранен')
    } catch (e) {
        console.log(e)
    }
}

export const setCashFileData = <(path, name, data, asString?) => Promise<void>>throttle(setCashFileDataNow, 2000);

export const getTasks = async (): Promise<TTaskList> => await getCashFileData('./database/tasks.json', 'tasks')
export const setTasks = async (tasks): Promise<void> => await setCashFileData('./database/tasks.json', 'tasks', tasks)

export const getHosts = async (): Promise<THost> => await getCashFileData('./database/hosts.json', 'hosts')
export const setHosts = async (hosts): Promise<void> => await setCashFileData('./database/hosts.json', 'hosts', hosts)

export const getRunning = async (): Promise<THost> => await getCashFileData('./database/running.json', 'running')
export const setRunning = async (running): Promise<void> => await setCashFileData('./database/running.json', 'running', running)

export const getProject = async (): Promise<string> => await getCashFileData('./database/project.db', 'project', true)
export const setProject = async (str): Promise<void> => await setCashFileData('./database/project.db', 'project', str, true)

export const getComponents = async () => {
    let arrDir = await getDirectories('./nodes/');
    let arrPath = arrDir.map(dir => './nodes/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};

export const addMess = async (mess: TMessage) => {
    try {
        if (mess.type == 'node-status') await updaterunningning(mess.data as TStatus);

        (global.messageSocket as WEBSocket).send(mess)
    } catch (e) {
        throw e;
    }

    return `Сообщение добавлено`;
};

const clearrunningningNow = async () => {
    let running: THost = await getRunning() || {};
    let hosts = await getHosts() || {};

    for (const [idr, {host, port}] of Object.entries(running)) {
        const hp = hosts[idr];
        if (!hp || hp.host != host || hp.port != port) {
            await killTask({host, port})
            delete running[idr];
        }
    }
    for (const [idr, {host, port}] of Object.entries(running)) {
        const {state} = await getStatusTask({host, port});
        if (state == 'stop') {
            delete running[idr];
        }
    }

};

export const clearrunningning = debounce(clearrunningningNow, 2000)

export const updaterunningning = async ({id, hostPort, state}: TStatus) => {
    let running: THost = await getRunning() ?? {};

    if (state == "run" || state == "error") {
        running[id] = <THostPort>hostPort;
    }
    if (running?.[id] && state == "stop") {
        delete running[id];
    }

    await clearrunningning();


    await setRunning(running)
}


export const isAllowHostPortServ = async (host, portNode, id = null): Promise<boolean> => {
    try {
        if (id) {
            const hosts = await getHosts();
            const running = await getRunning();
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