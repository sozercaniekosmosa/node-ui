import {NodeSelector, NodeUI} from "../editor/node-ui/node-ui";
import {apiRequest, compressString, debounce, decompressString, throttle} from "../utils";


let bufArrNodeParam: any[] = [];

export function copy(nui) {

    function getNodeParamFromElement(node: SVGElement) {
        const arrInNode = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
        const arrOutNode = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];

        let arrIn = [], arrOut = [];
        if (arrInNode.length) arrIn = arrInNode.map(node => node.dataset.name);
        if (arrOutNode.length) arrOut = arrOutNode.map(node => node.dataset.name)
        let nodeParam = {
            ...nui.getTransformPoint(node).add(10),
            nodeName: node.dataset.nodeName,
            arrIn,
            arrOut,
            color: node.querySelector('.handle').getAttribute('fill'),
            cfg: JSON.parse(decompressString(node.dataset.cfg)!)
        };
        return nodeParam;
    }

    let arrNodeParam: any[] = [];
    let arrNode = [...nui.svg.querySelectorAll('.' + NodeSelector.selected)]?.map(node => node.cloneNode(true)) as SVGElement[];

    if (arrNode.length == 0) return;

    arrNode.forEach(node => {
        let nodeParam = getNodeParamFromElement(node);
        arrNodeParam.push(nodeParam)
    })

    bufArrNodeParam = arrNodeParam
}

export function past(nui) {
    const arrNodeParam = bufArrNodeParam
    nui.svg.querySelectorAll('.' + NodeSelector.selected).forEach(el => el.classList.remove(NodeSelector.selected));
    arrNodeParam.forEach(nodeParam => {
        const newNode = nui.createNode(nodeParam)
        newNode.classList.add(NodeSelector.selected)
        nodeParam.x += 10;
        nodeParam.y += 10;
    })

}

export function cut(nui) {
    copy(nui);
    nui.removeNode();
}

