import {CanvasNodeUi, ObjectState} from "./canvas/canvas.js";
import {Svg} from "./svg.js";
import {getID} from "./utils.js";

class NodeUI {
    public svg: Svg;

    constructor(dest: HTMLElement) {
        this.svg = new Svg(dest)

        new CanvasNodeUi(this.svg);
        //@ts-ignore
        window.removeConnection = this.removeConnection;

        console.log('!!')
    }

    public createNode(
        x: number = 50, y: number = 50,
        quantIn: number = 2, quantOut: number = 2,
        type: string = 'empty', id: string = getID()
    ) {

        const r: number = 4;
        const offEdge: number = 8;
        const step: number = 8;
        const rx: number = 1;

        const maxQuant: number = Math.max(quantIn, quantOut);
        let width = 80;
        let height = offEdge + maxQuant * (r * 2 + step);

        const inX: number = r + offEdge;
        const inY: number = height * .5 - quantIn * (r * 2 + step) * .5 + step;
        const outX: number = width - r - offEdge;
        const outY: number = height * .5 - quantOut * (r * 2 + step) * .5 + step;

        const fillIn: string = '#bcffd6';
        const fillOut: string = '#ffc69a';
        const fillNode: string = '#d7d7d7';
        const stroke: string = '#25334b';

        const nodeGroup = this.svg.group({x, y, class: ObjectState.node, data: {type}});
        const rect = this.svg.rectangle({
            x: 0, y: 0, width, height, rx,
            stroke, fill: fillNode,
            to: nodeGroup,
            class: ObjectState.handle
        });
        rect.id = id;

        for (let i = 0, offY = 0; i < quantIn; i++, offY += r * 2 + step) {
            this.svg.circle(
                {
                    cx: inX, cy: inY + offY, r, stroke, fill: fillIn,
                    to: nodeGroup, class: [ObjectState.pinIn],
                    id: getID()
                });
        }
        for (let i = 0, offY = 0; i < quantOut; i++, offY += r * 2 + step) {
            this.svg.circle(
                {
                    cx: outX, cy: outY + offY, r, stroke, fill: fillOut,
                    to: nodeGroup, class: [ObjectState.pinOut],
                    id: getID()
                });
        }
    }
}

const nui = new NodeUI(document.querySelector('.canvas'))
nui.createNode(50, 50, 2, 5, 'value')
nui.createNode(200, 50)
