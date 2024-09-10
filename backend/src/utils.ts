import fs, {promises as fsPromises} from "fs";
import path, {resolve} from "path";
import net from "net";
import isLocalhost from "is-localhost-ip";
import {domainToASCII} from "node:url"
import {WebSocketServer, WebSocket} from "ws";
import global from "./global";

// export const writeToFile = (path: string, data: any) => {
//     try {
//         fs.writeFileSync(path, data);
//         console.log(`Файл ${path} сохранен!`);
//     } catch (err) {
//         throw 'Ошибка записи файла: ' + path
//     }
// };
//
//
// export const readFromFile = (path: string): any => {
//     try {
//         return fs.readFileSync(path);
//     } catch (err) {
//         throw 'Ошибка чтения файла: ' + path
//     }
// };

export const readFileAsync = async (path: string, options?): Promise<any> => {
    try {
        const data = await fsPromises.readFile(path, options);
        return data;
    } catch (err) {
        throw 'Ошибка чтения файла: ' + path
    }
};

export const writeFileAsync = async (path: string, data: any): Promise<any> => {
    try {
        await fsPromises.writeFile(path, data);
    } catch (err) {
        throw 'Ошибка записи файла: ' + path
    }
};


export async function getDirectories(srcPath: string) {
    const files = await fsPromises.readdir(srcPath);
    const directories = [];
    try {
        for (const file of files) {
            const filePath = path.join(srcPath, file);
            const stat = await fsPromises.stat(filePath);
            if (stat.isDirectory()) {
                directories.push(file);
            }
        }
    } catch (error) {
        console.error(`Ошибка при получении директорий ${srcPath}: ${error.message}`);
    }
    return directories;
}

export async function getDataFromArrayPath(arrPaths: string[]) {
    const filesContent = [];

    for (const p of arrPaths) {
        try {
            const stat = await fsPromises.stat(p);
            if (stat.isFile()) {
                const content = await readFileAsync(p, 'utf-8'); // Чтение содержимого файла
                filesContent.push({path: p, content}); // Сохраняем путь и содержимое
            } else if (stat.isDirectory()) {
                // Если это директория, получаем все файлы внутри
                const dirFiles = await fsPromises.readdir(p);
                const fullPaths = dirFiles.map(file => path.join(p, file));
                const nestedContent = await getDataFromArrayPath(fullPaths); // Рекурсивно получаем содержимое файлов из поддиректорий
                filesContent.push(...nestedContent);
            }
        } catch (error) {
            console.error(`Ошибка при обработке пути ${p}: ${error.message}`);
        }
    }

    return filesContent;
}

export class WEBSocket {
    private arrSubscriber = [];
    private activeConnections: WebSocket[] = [];

    constructor(webServer, {clbAddConnection = null, clbMessage = null, clbClose = null}?) {

        const wss = new WebSocketServer({server: webServer})

        wss.on('connection', (ws: WebSocket, req) => {// Слушатель для новых подключений WebSocket

            console.log('Соединение открыто');

            this.activeConnections.push(ws);
            clbAddConnection && clbAddConnection({ws, arrActiveConnection: this.activeConnections});
            this.arrSubscriber.forEach(clbSub => clbSub({type: 'connection', ws, arrActiveConnection: this.activeConnections}));

            ws.on('message', (mess) => { // Слушатель для входящих сообщений
                try {
                    let host = req.socket.remoteAddress;
                    if (host === '::1') host = 'localhost';

                    clbMessage && clbMessage({ws, arrActiveConnection: this.activeConnections, mess, host})
                    this.arrSubscriber.forEach(clbSub => clbSub({
                        type: 'message', ws, arrActiveConnection: this.activeConnections, mess, host
                    }));

                    console.log(mess)
                    // setTimeout(() =>ws.terminate(), 6000)
                } catch (e) {
                    ws.send(e);
                    console.log(e)
                }
            });
            ws.on('close', () => { // Слушатель для закрытия соединения
                const index = this.activeConnections.indexOf(ws);
                if (index !== -1) {
                    this.activeConnections.splice(index, 1);
                }
                clbClose && clbClose({ws, arrActiveConnection: this.activeConnections})
                this.arrSubscriber.forEach(clbSub => clbSub({type: 'close', ws, arrActiveConnection: this.activeConnections}));
                console.log('Соединение закрыто');
            });
        });
    }

    send = (mess) => this.activeConnections.forEach(ws => ws.send(JSON.stringify(mess)))
    getActiveConnections = () => this.activeConnections;
    subscribe = (clb) => {
        this.arrSubscriber.push(clb)
    }
}

/**
 * Wrapper для функции (clb), которая будет вызвана не раньше чем через ms мс. после
 * последнего вызова если в момент тишины с момента последнего вызова будет произведен
 * еще вызов то реальный вызов будет не раньше чем через ms мс. после него
 * @param clb
 * @param ms
 * @returns {(function(): void)|*}
 */
export const debounce = (func, ms) => {
    let timeout;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), ms);
    };
};

/**
 * Wrapper для функции (clb), которую нельзя вызвать чаще чем tm
 * @param clb
 * @param ms
 * @returns {(function(...[*]): void)|*}
 */
export const throttle = (clb, ms) => {

    let isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper(...arg: any) {

        if (isThrottled) { // (2)
            savedArgs = arguments;
            savedThis = this;
            return;
        }

        clb.apply(this, arguments); // (1)

        isThrottled = true;

        setTimeout(function () {
            isThrottled = false; // (3)
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }

    return wrapper;
}

const pathRoot = process.cwd();
export const pathResolveRoot = (path: string) => resolve(pathRoot, ...path.split(/\\|\//));

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