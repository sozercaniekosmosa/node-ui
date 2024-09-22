import {getDataFromArrayPath, getDirectories, WEBSocket} from "../../../utils";
import {killTask} from "./task";

import global from "../../../global"
import axios from "axios";
import {THost, TMessage, TRunningList, TStatus} from "../../../../../general/types";
import isLocalhost from "is-localhost-ip";
import {domainToASCII} from "node:url";
import net from "net";
import {readHosts, readRunning, writeRunning} from "./database";

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
        console.log(mess)
    } catch (e) {
        throw e;
    }

    return `Сообщение добавлено`;
};

export const updateStatesRunning = async () => {
    let running: TRunningList = await readRunning() || {};
    let hosts = await readHosts() || {};

    //удаляем все которые не соответствуют настройкам
    for (const {id, hostPort: {host, port}, state} of Object.values(running)) {
        const hp = hosts[id];
        if (!hp || hp.host != host || hp.port != port) {
            await killTask({host, port});
            delete running[id];
        }
    }

    await writeRunning(running)
};

export const setStateRunning = async (status: TStatus) => {
    await updateStatesRunning();

    let running: TRunningList = await readRunning() ?? {};
    const {id, hostPort, state} = status;

    if (state == "run" || state == "error") {
        running[id] = status;
    }
    if (running?.[id] && state == "stop") {
        delete running[id];
    }
    await writeRunning(running)
}


export const isAllowHostPort = async (host, port, id = null): Promise<boolean> => {
    try {
        if (id) {
            const hosts: THost = await readHosts();
            //если хост с портом уже используются
            if (Object.entries(hosts).some(([_id, {host: h, port: p}]) => _id != id && h == host && p == port))
                return new Promise<boolean>(r => r(false))

            const running = await readRunning();
            //если сервис запущен и хост с портом совпадают то true
            if (running[id] && hosts[id].host == host && hosts[id].port == port) {
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

                server.listen(port);
            });
        } else {
            try { // когда поняли что это не локальный хост запрашиваем данные у агентов извне
                //TODO: global.port - порт заменить на значение порта из карты агентов
                const {data: isAllow} = await axios.get(`http://${host}:${global.port}/api/v1/service/host-port/${host}/${port}`)
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