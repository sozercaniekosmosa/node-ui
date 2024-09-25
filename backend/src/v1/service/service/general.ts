import {getDataFromArrayPath, getDirectories, WEBSocket} from "../../../utils";
import {killTask} from "./task";

import global from "../../../global"
import axios from "axios";
import {THost, TMessage, TRunningList, TStatus} from "../../../../../general/types";
import isLocalhost from "is-localhost-ip";
import {domainToASCII} from "node:url";
import net from "net";
import {readHosts} from "./database";

export const readToolbox = async () => {
    let arrDir = await getDirectories('./nodes/');
    let arrPath = arrDir.map(dir => './nodes/' + dir + '/config.json');
    let arrFile = await getDataFromArrayPath(arrPath);
    let arrData = arrFile.map(file => JSON.parse(file.content));
    return arrData;
};

export const addMess = async (mess: TMessage) => {
    try {
        if (global.messageSocket) (global.messageSocket as WEBSocket).send(mess)
        console.log(mess)
    } catch (e) {
        throw e;
    }

    return `Сообщение добавлено`;
};

export const isAllowHostPort = async (host, port, id = null): Promise<boolean> => {
    try {
        if (id) {
            const hosts: THost = await readHosts();
            //если хост с портом уже используются
            if (Object.entries(hosts).some(([_id, {host: h, port: p}]) => _id != id && h == host && p == port))
                return new Promise<boolean>(r => r(false))

            const listRunning = global.listRunning;
            //если сервис запущен и хост с портом совпадают то true
            if (listRunning[id] && hosts[id].host == host && hosts[id].port == port) {
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