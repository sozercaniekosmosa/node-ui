import {spawn} from "child_process";
import global from "../../../global"
import axios from "axios";
import {TMessage, TRunningList, TStatus, TTaskList} from "../../../../../general/types";
import {addMess, isAllowHostPort} from "./general";
import {checkFileExists, pathResolveRoot} from "../../../utils";
import {readHosts, readTasks, writeHosts, writeTasks} from "./database";
import terminate from "terminate";


export const writeAllTasks = async (tasks: TTaskList): any => {
    let oldHosts = await readHosts();

    try {
        let newHosts = {}
        let arrTask = Object.values(tasks);
        arrTask.forEach(({id, hostPort: {host, port}}) => newHosts[id] = {host, port})

        if (oldHosts) {//если есть старые хосты
            for (const [oldID, hostPort] of Object.entries(oldHosts)) {//перебераем все старые
                const newHost = newHosts[oldID];
                if (!newHost || newHost.host != hostPort.host || newHost.port != hostPort.port) { //если среди новых нет старого ID прибиваем процесс по строму ID
                    killTask(oldID)
                }
            }
        }

        await writeTasks(tasks)
        await writeHosts(newHosts)

    } catch (error) {
        throw error;
    }
};
export const readTask = async (id: string) => {
    const tasks: TTaskList = await readTasks();
    const hosts = await readHosts();

    let task = tasks[id]

    return {task, hosts};
};

export const startTasks = async () => {
    const taskList: TTaskList = await readTasks();
    Object.values(taskList).forEach(({id}) => startTask(id))
};
export const killTasks = async () => Object.values(global.listRunning).forEach(({id}) => killTask(id));

export async function sendListRan() {
    let data = {}
    Object.values(global.listRunning).forEach(({name, id}) => data[id] = {name, id})
    await addMess({type: 'list-run', data});
}

export const startTask = async id => {
    const taskList: TTaskList = await readTasks();
    const {nodeName, cfg, in: input, out, hostPort: {host, port}} = taskList[id];

    let pfx = '';
    // cfg.forEach(([title, val, type]) => {
    //     (type == 'code-editor') && (pfx = '.' + val.lang);
    // })

    let path = pathResolveRoot(`./nodes/${nodeName}/launch${pfx}.bat`)

    if (global.listRunning?.[id]) {
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
                    delete global.listRunning[id];
                    await sendListRan();

                    console.log('stop:' + id);
                });
                child.on("exit", async function (code) {
                    global.listRunning[id] = {id, name: nodeName, child};
                    await sendListRan();

                    console.log('closing code: ' + code);
                });
                console.log(child.pid)
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
};
export const killTask = async (id = null): any => {
    try {

        if (global.listRunning?.[id]) {
            terminate(global.listRunning[id].child.pid, async mess => {
                console.log(mess)
                await addMess({type: 'node-log', data: {id, message: 'Процесс завершен'}});
            })
            return `Процессу id: ${id}: отправлена комманда на завершение`
        } else {
            return `Процесс id: ${id}: не запущен`
        }
    } catch (e) {
        return `Процесс ${id}: не ответил на команду завершения`
    }
}

export const taskCMD = async (id, cmd): Promise<any> => {
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

};


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