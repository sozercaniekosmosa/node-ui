import {NodeSelector, NodeUI} from "./editor/node-ui/node-ui";

type TPinsCfgNode = { name: string, id: string, to: string[] }[];

interface ItemNodeCfg {
    name: string,
    in?: TPinsCfgNode,
    out?: TPinsCfgNode,
}

type TCfgNode = Record<string, ItemNodeCfg>;


export default class Calc {
    private svg: SVGElement;
    dataMap: object = {};
    private listCfgNode: TCfgNode = {};

    constructor(private nu: NodeUI, private nodeRun: Element | null) {
        this.svg = nu.svg;
        this.listCfgNode = this.getListCfgNode();

        // arrNode[0].


        console.log(this.listCfgNode)

        this.svg.addEventListener('dblclick', (e: MouseEvent) => this.handlerDblClick(e));
    }

    private getListCfgNode(): TCfgNode {
        let arrNode = this.svg.querySelectorAll('.' + NodeSelector.node) as NodeListOf<HTMLElement>;
        let cfg = {};
        console.log(arrNode)
        arrNode.forEach(node => {
            let id = node.id;
            !(cfg?.[id]) && (cfg[id] = {})
            cfg[id].name = node.dataset.node;
            var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
            var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];
            if (arrIn.length) cfg[id].in = arrIn.map((node) => ({name: node.dataset.name, id, to: node.dataset.to?.split(' ') ?? [],}));
            if (arrOut.length) cfg[id].out = arrOut.map((node) => ({name: node.dataset.name, id, to: node.dataset.to?.split(' ') ?? [],}))
        })
        return cfg;
    }

    private handlerDblClick({target}: MouseEvent) {
        var isTarget = (target as Element).classList.contains(NodeSelector.handle)
        if (isTarget) {

        }
    }
}

export {}