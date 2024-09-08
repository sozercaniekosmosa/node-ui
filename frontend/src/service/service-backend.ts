import {NodeSelector} from "../editor/node-ui/node-ui";
import {apiRequest, ContentType, debounce, decompressString, eventBus, webSocket} from "../utils";
import {TMessage, TTask, TTaskList} from "../../../general/types"


let port = 3000;
let routService: string = `http://localhost:${port}/api/v1/service/`;


function getComponentStruct(node, nodeProject): TTask {

    let data: TTask = {cfg: [], hostPort: {host: "", port: 0}, id: "", nodeName: ""};
    data.id = node.id;
    data.nodeName = node.dataset.nodeName;
    data.cfg = [];

    type TParam = { name: string, type: string, val: any, title: string, arrOption: [string] }
    type TArrCfg = [string, [TParam]]

    const arrCfg = JSON.parse(decompressString(node.dataset.cfg)!);

    const excludeFields = new Set(['description']);
    (Object.entries(arrCfg) as [TArrCfg]).forEach(([tabName, arrParam]) =>
        arrParam.forEach(({name, type, val}) => {
            if (name === 'hostPort') {
                data.hostPort = val;
                return;
            }
            !excludeFields.has(name) && (data.cfg.push([name, val, type]));
        }));

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

async function get(route: string, contentType?: ContentType) {
    return await apiRequest(route, {method: 'GET', contentType});
}

async function post(route: string, contentType: ContentType, data?: any) {
    return await apiRequest(route, {method: 'POST', contentType, body: data});
}

const writeProjectNow = async (node: HTMLElement) => {
    try {
        let project = node.innerHTML;
        let htmlProject = await put(routService + 'project', 'text/plain', project)
        console.log(htmlProject);

        let arrTask = getTasks(node);
        let textTask = await put(routService + 'task', 'application/json', arrTask)
        console.log(textTask);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
export const writeProject = <(node: HTMLElement) => void>debounce(writeProjectNow, 1000)

export async function readProject() {
    try {
        //@ts-ignore
        const html = await get(routService + 'project', 'text/plain')
        console.log('project загружен');
        return html;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function getToolbox() {
    try {
        //@ts-ignore
        const listToolbox = await get(routService + 'toolbox', 'application/json')
        console.log('toolbox загружен');
        return listToolbox;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function startTask() {
    try {
        let text = await post(routService + 'task/start', 'text/plain')
        console.log(text);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function stopTask() {
    try {
        let text = await post(routService + 'task/stop', 'text/plain')
        console.log(text);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

export async function sendCmd(id, cmd) {
    try {
        let text = await post(routService + `cmd/${id}`, 'text/plain', cmd)
        console.log(text);
    } catch (error) {
        console.error(`Ошибка команды: ${id}.${cmd}`, error);
    }
}

let _old = 0;
let _isPortInUse;
let old = 0;

export async function isAllowHostPort(host, port, id) {
    try {

        old++;
        let isPortInUse = await get(routService + `host-port/${host}/${port}/${id}`)

        //эта часть нужна на случай когда на сервер отправлено несколько запросов, нужно оставить только самый последний
        if (old == _old) isPortInUse = _isPortInUse; // если вернулся ответ сервера от более раннего запроса ответ игнорируем
        _isPortInUse = isPortInUse;
        _old = old;

        return isPortInUse;
    } catch (error) {
        console.error(`Ошибка проверки порта: ${port}`, error);
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


export async function createMessageSocket() {
    try {
        webSocket({
            host: 'localhost', port: 3000, timeReconnect: 1500,
            clbMessage: ({data: mess}) => {
                console.log("Получены данные: " + mess);
                const {type, data} = <TMessage>JSON.parse(mess);
                eventBus.dispatchEvent('message-socket', {type, data})
            }
        })
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        // setTimeout(() => messageSocket(nui), 2000);
    }
}

export default {isAllowHostPort}
