import {spawn} from "child_process";
import global from "../../../global"
import axios from "axios";
import {TMessage, TRunningList, TStatus, TTaskList} from "../../../../../general/types";
import {addMess, isAllowHostPort} from "./general";
import {checkFileExists, pathResolveRoot} from "../../../utils";
import {readHosts, readRunning, readTasks, writeHosts, writeTasks} from "./database";


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

export const writeTasks = async (tasks: TTaskList): any => {
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

export async function startTasks() {
    const taskList: TTaskList = await readTasks();
    Object.values(taskList).forEach(({id}) => {
        launchTask(id)
    })
    return;
}
export async function killTasks() {
    const taskList: TTaskList = await readTasks();
    Object.values(taskList).forEach(({id}) => {
        killTask({id})
    })
    return;
}

/*export async function requestStatusTask({id = null, host = null, port = null}): Promise<TStatus> {
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
}*/

export async function launchTask(id) {
    const taskList: TTaskList = await readTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port}} = taskList[id];

    let pfx = '';
    // cfg.forEach(([title, val, type]) => {
    //     (type == 'code-editor') && (pfx = '.' + val.lang);
    // })

    let path = pathResolveRoot(`./nodes/${nodeName}/launch${pfx}.bat`)

    let runningList = await <TRunningList>readRunning();
    if (runningList?.[id]) {
        return `Сервис ${id} уже запущен`
    } else {
        //если сервис еще не запущен
        try {
            if (await isAllowHostPort(host, port, id)) {
                if (!await checkFileExists(path))
                    throw {status: 500, message: `Файл [${path}] не существует`};
                // const child = spawn('start', [path, global.port, id], { //запускаем
                const child = spawn('start', ['/B', path, global.port, id], { //запускаем
                    cwd: `./nodes/${nodeName}`,
                    shell: true,
                    // detached: true,  // Открепляет процесс
                    // stdio: ['ignore', 'inherit', 'inherit']
                    // stdio: 'ignore'     // Игнорирует стандартные потоки ввода/вывода
                });
                child.on("close", async function (code) {
                    await addMess({type: 'node-status', data: <TStatus>{state: 'stop', hostPort: {host, port}, id}});
                    console.log('stop:' + id);
                });
                child.on("exit", async function (code) {
                    await addMess({type: 'node-status', data: <TStatus>{state: 'run', hostPort: {host, port}, id}});
                    console.log('closing code: ' + code);
                    return
                });

                child.unref();
                console.log(child)
                return `Команда на запуск сервиса ${id} принята`;
            } else {
                await addMess(<TMessage>{
                    type: 'log',
                    data: `Сервис:${id} запустить не удалось ${host}:${port} заняты`
                })
            }
        } catch (e) {
            console.log(e)
            throw {status: 500, message: `Сервис [${id}] запустить не удалось ${e}`};
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