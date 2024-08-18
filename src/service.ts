import {NodeSelector, NodeUI} from "./editor/node-ui/node-ui";
import {decompressString} from "./utils";

export type TEventService = {
    name: 'calc' | 'save'| 'read',
    data?: any
}

type TPinsCfgNode = { name: string, id: string, to: string[] }[];

interface ItemNodeCfg {
    name: string,
    in?: TPinsCfgNode,
    out?: TPinsCfgNode,
}

type TCfgNode = Record<string, ItemNodeCfg>;

export default class Service {

    bufArrCfg: any[] = [];
    private nui: NodeUI;

    constructor(nui) {
        if (!nui) throw 'Node IU - не существует.'
        this.nui = nui
    }

    onCopy() {
        let nui = this.nui;

        function elementToObject(node: SVGElement) {
            var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
            var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];

            let cfgIn = [], cfgOut = [];
            if (arrIn.length) cfgIn = arrIn.map(node => node.dataset.name);
            if (arrOut.length) cfgOut = arrOut.map(node => node.dataset.name)
            let cfg = {
                ...nui.getTransformPoint(node).add(10),
                nodeName: node.dataset.node,
                arrIn: cfgIn,
                arrOut: cfgOut,
                color: node.querySelector('.handle').getAttribute('fill'),
                data: {cfg: node.dataset.cfg}
            };

            if (node.dataset?.cfg) cfg["cfg"] = JSON.parse(decompressString(node.dataset.cfg)!);
            return cfg;
        }

        let arrCfg: any[] = [];
        let arrNode = [...this.nui.svg.querySelectorAll('.' + NodeSelector.selected)]?.map(node => node.cloneNode(true)) as SVGElement[];

        if (arrNode.length == 0) return;

        arrNode.forEach(node => {
            let cfg = elementToObject(node);
            arrCfg.push(cfg)
        })

        this.bufArrCfg = arrCfg
    }

    onPast() {
        const arrCfg = this.bufArrCfg
        this.nui.svg.querySelectorAll('.' + NodeSelector.selected).forEach(el => el.classList.remove(NodeSelector.selected));
        arrCfg.forEach(cfg => {
            const newNode = this.nui.createNode(cfg)
            newNode.classList.add(NodeSelector.selected)
            cfg.x += 10;
            cfg.y += 10;
        })

    }

    onCut() {
        this.onCopy();
        this.nui.removeNode();
    }

    getNodeStruct(): TCfgNode {
        let arrNode = this.nui.svg.querySelectorAll('.' + NodeSelector.node) as NodeListOf<HTMLElement>;
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
                        let node = this.nui.svg.querySelector('#' + it) as HTMLElement;
                        return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
                    }) ?? []
                }
            })
            if (arrOut.length) arrOut.forEach((node) => {
                if (node.dataset?.to?.length) {
                    if (!d?.out) d.out = {}
                    d.out[node.dataset.name] = node.dataset.to?.split(' ').map(it => {
                        let node = this.nui.svg.querySelector('#' + it) as HTMLElement;
                        return node.closest('.' + NodeSelector.node).id + '.' + node.dataset.name
                    }) ?? []
                }
            })
        })
        return data;
    }
}