import {NodeSelector, NodeUI} from "./node-ui.js";

export class Calc {
    private svg: SVGElement;
    data: object = {};
    private listNode: object = {};

    constructor(private nu: NodeUI, private nodeRun: Element) {
        this.svg = nu.svg;
        let arrNode = this.svg.querySelectorAll('.' + NodeSelector.node);
        arrNode.forEach(node => {
            this.listNode[node.id] = {
                in: node.querySelectorAll('.' + NodeSelector.pinIn),
                out: node.querySelectorAll('.' + NodeSelector.pinOut)
            }
        })

        // arrNode[0].


        console.log(arrNode)
        console.log(this.listNode)
    }
}