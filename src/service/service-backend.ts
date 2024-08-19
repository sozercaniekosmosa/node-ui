import {NodeSelector, NodeUI} from "../editor/node-ui/node-ui";
import {apiRequest, compressString, debounce, decompressString, throttle} from "../utils";

export type TEventService = {
    name: 'calc' | 'save' | 'read',
    data?: any
}

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

        // ullyYU6
        //     name:"value"
        //     out:{x: Array(1)}

        d.name = node.dataset.node;
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

export const writeProject = throttle((async (node: HTMLElement) => {
    try {
        let data = await apiRequest<{ message: string }>('http://localhost:3000/api/v1/project', {
            method: 'PUT',
            contentType: 'text/plain',
            body: compressString(node.innerHTML),
        });
        console.log(data);

        data = await apiRequest<{ message: string }>('http://localhost:3000/api/v1/task', {
            method: 'PUT',
            contentType: 'application/json',
            body: getNodeStruct(node),
        });
        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}), 5000)


export async function readProject() {
    try {
        const {data} = await apiRequest<{ message: string }>('http://localhost:3000/api/v1/project', {
            method: 'GET',
            contentType: 'text/plain'
        });
        return <string>await decompressString(data);
        // console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}