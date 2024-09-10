import {config} from "dotenv";
import {resolve} from "path";
import {spawn} from "child_process";

import global from "../../../global"
import axios from "axios";
import {TMessage, TStatus, TTaskList} from "../../../../../general/types";
import {addMess, getHosts, getTasks, isAllowHostPortServ, setHosts, setTasks} from "./general";
import {pathResolveRoot} from "../../../utils";


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

        await setTasks(tasks)
        await setHosts(newHosts)

    } catch (error) {
        throw error;
    }
};

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