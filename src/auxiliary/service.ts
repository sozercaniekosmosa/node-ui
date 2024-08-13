import {NodeSelector, NodeUI} from "../editor/node-ui/node-ui";
import {decompressString} from "../utils";

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
}