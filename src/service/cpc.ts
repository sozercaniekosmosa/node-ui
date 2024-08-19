import {NodeSelector, NodeUI} from "../editor/node-ui/node-ui";
import {apiRequest, compressString, debounce, decompressString, throttle} from "../utils";


let bufArrCfg: any[] = [];

export function copy(nui) {

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
    let arrNode = [...nui.svg.querySelectorAll('.' + NodeSelector.selected)]?.map(node => node.cloneNode(true)) as SVGElement[];

    if (arrNode.length == 0) return;

    arrNode.forEach(node => {
        let cfg = elementToObject(node);
        arrCfg.push(cfg)
    })

    bufArrCfg = arrCfg
}

export function past(nui) {
    const arrCfg = bufArrCfg
    nui.svg.querySelectorAll('.' + NodeSelector.selected).forEach(el => el.classList.remove(NodeSelector.selected));
    arrCfg.forEach(cfg => {
        const newNode = nui.createNode(cfg)
        newNode.classList.add(NodeSelector.selected)
        cfg.x += 10;
        cfg.y += 10;
    })

}

export function cut(nui) {
    copy(nui);
    nui.removeNode();
}

