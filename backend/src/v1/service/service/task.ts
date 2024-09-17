import {spawn} from "child_process";
import global from "../../../global"
import axios from "axios";
import {TMessage, TRunningList, TStatus, TTaskList} from "../../../../../general/types";
import {addMess, isAllowHostPortServ, readHosts, readRunning, readTasks, writeHosts, writeTasks} from "./general";
import {pathResolveRoot} from "../../../utils";


export const killTask = async ({id = null, host = null, port = null}): any => {
    try {
        const runningList: TRunningList = await readRunning();
        if (id) {
            let runningTask = runningList?.[id];
            if (!runningTask) {
                await addMess({type: 'node-log', data: {id, message: 'Задача не запущена'}});
                return `Процесс id: ${id}:(${host}:${port}) процесс не запущен`
            }
            const {hostPort} = runningTask as TStatus;
            host = hostPort.host;
            port = hostPort.port;
        }

        const {data: {text}} = await axios.post(`http://${host}:${port}/kill`)
        return `Процесс (${host}:${port})` + text;
    } catch (e) {
        return `Процесс (${host}:${port}) не ответил на команду завершения`
    }
}

export const storeTasks = async (tasks: TTaskList): any => {
    let oldHosts = await readHosts();

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

        await writeTasks(tasks)
        await writeHosts(newHosts)

    } catch (error) {
        throw error;
    }
};

export async function launchTasks() {
    const taskList: TTaskList = await readTasks();
    Object.values(taskList).forEach(({id, nodeName, cfg, in: input, out}) => {

    })
    return;
}

export async function requestStatusTask({id = null, host = null, port = null}): Promise<TStatus> {
    try {
        if (id && !(host || port)) {
            const hosts = readHosts();
            host = hosts[id].host;
            port = hosts[id].port;
        }

        const {data: status}: TStatus = await axios.get(`http://${host}:${port}/status`);
        return status;
    } catch (e) {
        return <TStatus>{state: 'stop', hostPort: {host, port}, id}
    }
}

export async function launchTask(id) {
    const taskList: TTaskList = await readTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port: portNode}} = taskList[id];

    let path = pathResolveRoot(`./nodes/${nodeName}/launch.bat`)


    let {state} = await requestStatusTask({host, port: portNode});
    if (state == 'run') {
        return `Сервис ${id} уже запущен`
    } else {
        //если сервис еще не запущен
        try {
            if (await isAllowHostPortServ(host, portNode)) {
                // const child = spawn('start', [path, global.port, id], { //запускаем
                    const child = spawn('start', ['/B', path, global.port, id], { //запускаем
                    cwd: `./nodes/${nodeName}`,
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

export async function taskCMD(id, cmd): Promise<any> {
    const taskList: TTaskList = await readTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port: portNode}} = taskList[id];

    console.log(id)
    try {
        const res = await axios.post(`http://${host}:${portNode}/cmd/${cmd}`)
        console.log(res.data)
        return res.data;
    } catch (error) {
        if (error?.name == 'AxiosError') throw {status: error.response.status, message: error.message};
        throw error;
    }

}

export const readTask = async (id: string) => {
    const tasks: TTaskList = await readTasks();
    const hosts = await readHosts();

    let task = tasks[id]

    return {task, hosts};
};