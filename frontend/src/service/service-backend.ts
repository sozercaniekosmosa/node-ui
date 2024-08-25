import {NodeSelector} from "../editor/node-ui/node-ui";
import {apiRequest, ApiRequestOptions, ContentType, debounce, decompressString, throttle} from "../utils";

let port = 3000;
let routService: string = `http://localhost:${port}/api/v1/service/`;

type TCfg = [string, any, string];

interface TNodeTask {
    id: string,
    nodeName: string,
    cfg: TCfg[],
    in?: {},
    out?: {},
}

interface TTaskList {
    [key: string]: TNodeTask
}


function getComponentStruct(node, nodeProject): TNodeTask {

    let data: TNodeTask = {cfg: [], id: "", nodeName: ""};
    data.id = node.id;
    data.nodeName = node.dataset.nodeName;
    data.cfg = [];

    type TParam = { name: string, type: string, val: any, title: string, arrOption: [string] }
    type TArrCfg = [string, [TParam]]

    const cfg = JSON.parse(decompressString(node.dataset.cfg)!);

    const excludeFields = new Set(['description']);
    (Object.entries(cfg) as [TArrCfg]).forEach(([tabName, arrParam]) =>
        arrParam.forEach(({name, type, val}) => !excludeFields.has(name) && (data.cfg.push([name, val, type]))));

    var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
    var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];

    if (arrIn.length) arrIn.forEach((node) => {
        if (node.dataset?.to?.length) {
            if (!data?.in) data.in = {}
            data.in[node.dataset.name] = node.dataset.to?.split(' ').map(it => {
                let node = nodeProject.querySelector('#' + it) as HTMLElement;
                return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
            }) ?? []
        }
    })

    if (arrOut.length) arrOut.forEach((node) => {
        if (node.dataset?.to?.length) {
            if (!data?.out) data.out = {}
            data.out[node.dataset.name] = node.dataset.to?.split(' ').map(it => {
                let node = nodeProject.querySelector('#' + it) as HTMLElement;
                return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
            }) ?? []
        }
    })

    return data;
}


export function getTasks(nodeProject): TTaskList {
    let arrNode = nodeProject.querySelectorAll('.' + NodeSelector.node) as NodeListOf<HTMLElement>;
    let res = {};
    arrNode.forEach(node => {
        res[node.id] = getComponentStruct(node, nodeProject)
    })
    return res;
}


async function put(route: string, contentType: ContentType, data: any) {
    return await apiRequest(route, {method: 'PUT', contentType, body: data});
}

async function get(route: string, contentType: ContentType) {
    return await apiRequest(route, {method: 'GET', contentType});
}

async function post(route: string, contentType: ContentType, data?: any) {
    return await apiRequest(route, {method: 'POST', contentType, body: data});
}

const writeProjectNow = async (node: HTMLElement) => {
    try {
        let project = node.innerHTML;
        let dataProject = await put(routService + 'project', 'text/plain', project)
        console.log(dataProject);

        let arrTask = getTasks(node);
        let dataTask = await put(routService + 'task', 'application/json', arrTask)
        console.log(dataTask);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};

const writeTaskNow = async (node: HTMLElement, nodeProject: HTMLElement) => {
    try {

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};


export const writeProject = <(node: HTMLElement) => void>debounce(writeProjectNow, 1000)
export const writeTask = <(node: HTMLElement, nodeProject: HTMLElement) => void>debounce(writeTaskNow, 50)


export async function readProject() {
    try {
        //@ts-ignore
        const data = await get(routService + 'project', 'text/plain')
        console.log('project загружен');
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function getToolbox() {
    try {
        //@ts-ignore
        const data = await get(routService + 'toolbox', 'application/json')
        console.log('toolbox загружен');
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
    let blobUrl: string;
    try {
        const response = await fetch(moduleUrl);

        if (!response.ok) throw new Error('Network response was not ok');

        const code = await response.text();
        // let arr = JSON.parse(code)
        // Создаем новый Blob с загруженным кодом
        const blob = new Blob([code], {type: 'application/javascript'});
        blobUrl = URL.createObjectURL(blob);

        const module = await import(/*@vite-ignore*/blobUrl);

        return module;

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