import {config} from "dotenv";
import {debounce, readData, throttle, writeData} from "../../../utils";
import zlib, {InputType} from "node:zlib"
import * as Buffer from "buffer";
import {THost, TRunningList, TTaskList} from "../../../../../general/types";
import {addMess} from "./general";

const {parsed: {MAX_MESSAGE_TASK, TIME_MESSAGE_CYCLE}} = config();


export async function decompressGzip(buffer: Buffer): Promise<Buffer> {
    try {
        return new Promise((resolve, reject) => zlib.gunzip(<InputType>buffer, (err, result) => err ? reject(err) : resolve(result)));
    } catch (error) {
        throw error;
    }
}

const _cashFileData = {};
export const getCashFileData = async <T>(path, asString = false): Promise<T> => {
    let data;
    try {
        if (_cashFileData[path]) {
            data = _cashFileData[path]
        } else {
            const strData = await readData(path, 'utf-8');
            data = asString ? strData : JSON.parse(strData);
            _cashFileData[path] = data;
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
        for (const {path, data, asString = false} of Object.values(list)) {
            _cashFileData[path] = data;
            strData = asString ? data : JSON.stringify(data, null, 2);
            await writeData(path, strData);
            console.log('файл:' + path, 'сохранен')
        }
        listQueue = {}
    } catch (e) {
        console.log(e)
    }
}, 2000)

export const setCashFileData = async (path, data, asString = false): Promise<void> => {
    listQueue[path] = {path, data, asString};
    _cashFileData[path] = data;
    await setCashFileDataWait(<any>listQueue)
};

export const readTasks = async (): Promise<TTaskList> => await getCashFileData('./database/tasks.json',)
export const writeTasks = async (tasks): Promise<void> => await setCashFileData('./database/tasks.json', tasks)

export const readHosts = async (): Promise<THost> => await getCashFileData('./database/hosts.json',)
export const writeHosts = async (hosts): Promise<void> => await setCashFileData('./database/hosts.json', hosts)

export const readLog = async (): Promise<TRunningList> => await getCashFileData('./database/log.text', true)
export const writeLog = async (running: TRunningList): Promise<void> => await setCashFileData('./database/log.text', running, true)

export const readProject = async (): Promise<string> => await getCashFileData('./database/project.db', true)
export const writeProject = async (str): Promise<void> => await setCashFileData('./database/project.db', str, true)