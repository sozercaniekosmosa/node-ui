import {NodeSelector} from "../editor/node-ui/node-ui";
import {apiRequest, ApiRequestOptions, ContentType, debounce, decompressString, throttle} from "../utils";

let port = 3000;
let routService: string = `http://localhost:${port}/api/v1/service/`;

type TPinsCfgNode = { name: string, id: string, to: string[] }[];

interface ItemNodeCfg {
    name: string,
    in?: TPinsCfgNode,
    out?: TPinsCfgNode,
}

type TCfgNode = Record<string, ItemNodeCfg>;


export function getNodeStruct(nodeProject): TCfgNode {
    let arrNode = nodeProject.querySelectorAll('.' + NodeSelector.node) as NodeListOf<HTMLElement>;
    let data = {};
    console.log(arrNode)
    arrNode.forEach(node => {
        let id = node.id;
        !(data?.[id]) && (data[id] = {})
        let d = data[id];

        d.node = node.dataset.node;
        d.cfg = [];

        type TParam = { name: string, type: string, val: any, title: string, arrOption: [string] }
        type TArrCfg = [string, [TParam]]

        const cfg = JSON.parse(decompressString(node.dataset.cfg)!);

        const excludeFields = new Set(['description']);
        (Object.entries(cfg) as [TArrCfg]).forEach(([tabName, arrParam]) =>
            arrParam.forEach(({name, type, val}) => !excludeFields.has(name) && (d.cfg.push([name, val, type]))));

        var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
        var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];

        if (arrIn.length) arrIn.forEach((node) => {
            if (node.dataset?.to?.length) {
                if (!d?.in) d.in = {}
                d.in[node.dataset.name] = node.dataset.to?.split(' ').map(it => {
                    let node = nodeProject.querySelector('#' + it) as HTMLElement;
                    return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
                }) ?? []
            }
        })
        if (arrOut.length) arrOut.forEach((node) => {
            if (node.dataset?.to?.length) {
                if (!d?.out) d.out = {}
                d.out[node.dataset.name] = node.dataset.to?.split(' ').map(it => {
                    let node = nodeProject.querySelector('#' + it) as HTMLElement;
                    return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
                }) ?? []
            }
        })
    })
    return data;
}

async function put(route: string, contentType: ContentType, data: any) {
    return await apiRequest<{ message: string }>(route, {method: 'PUT', contentType, body: data});
}

async function get(route: string, contentType: ContentType) {
    return await apiRequest<{ message: string }>(route, {method: 'GET', contentType});
}

async function post(route: string, contentType: ContentType, data?: any) {
    return await apiRequest<{ message: string }>(route, {method: 'POST', contentType, body: data});
}

const writeProjectNow = async (node: HTMLElement) => {
    try {
        // let body = await compress(node.innerHTML);
        let body = node.innerHTML;
        let dataProject = await put(routService + 'project', 'text/plain', body)
        let dataTask = await put(routService + 'task', 'application/json', getNodeStruct(node))
        console.log(dataProject);
        console.log(dataTask);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


export const writeProject = <(node: HTMLElement) => void>debounce(writeProjectNow, 1000)


export async function readProject() {
    try {
        //@ts-ignore
        const {status, data} = await get(routService + 'project', 'text/plain')
        console.log(status, 'project загружен');
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function startTask() {
    try {
        let resp = await post(routService + 'task/start', 'text/plain')
        console.log(resp);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function stopTask() {
    try {
        let resp = await post(routService + 'task/stop', 'text/plain')
        console.log(resp);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function loadModule(moduleUrl) {
    // URL вашего модуля
    // const moduleUrl = 'path/to/your/module.js';
    let blobUrl: string;
    try {
        // Используем fetch для загрузки модуля
        const response = await fetch(moduleUrl);

        if (!response.ok) throw new Error('Network response was not ok');

        const code = await response.text();

        // Создаем новый Blob с загруженным кодом
        const blob = new Blob([code], {type: 'application/javascript'});
        blobUrl = URL.createObjectURL(blob);

        // Динамически импортируем модуль
        const module = await import(blobUrl);

        // Теперь вы можете использовать функции и переменные из модуля
        return module; // или module.someFunction();

    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Освобождаем объект URL
        URL.revokeObjectURL(blobUrl);
    }

}

// function myRecursiveFunction() {
//     console.log("Эта функция выполняется каждые 2 секунды");
//     setTimeout(myRecursiveFunction, 2000);
// }
// // Запускаем функцию
// myRecursiveFunction();