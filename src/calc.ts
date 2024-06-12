import {NodeSelector, NodeUI} from "./node-ui.js";

export class Calc {
    private svg: SVGElement;

    constructor(private nu: NodeUI, private nodeRun: Element) {
        this.svg = nu.svg;
        let arrNode = this.svg.querySelectorAll('.' + NodeSelector.node);

        // arrNode[0]

        console.log(arrNode)
    }
}