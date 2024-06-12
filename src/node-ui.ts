import {Svg} from "./svg.js";
import {getID} from "./utils.js";
import {LinkCreate} from "./editor/link-create.js";
import {LinkRemove} from "./editor/link-remove.js";
import {Drag} from "./editor/drag.js";
import {Selection} from "./editor/selection.js";
import {Pan} from "./editor/pan.js";

export const NodeSelector = {
    selected: 'selected',
    node: 'node',
    handle: 'handle',
    link: 'link',
    linkRemove: 'link-remove',
    pinIn: 'pin-in',
    pinOut: 'pin-out',
}

export class NodeUI extends Svg {
    private mode: string = '';
    public key: string[] = [];

    // private width: number = 0;
    // private height: number = 0;

    // private readonly svg: SVGElement;
    private selection: Selection;
    private linkCreate: LinkCreate;
    private linkRemove: LinkRemove;
    private drag: Drag;
    private pan: Pan;

    constructor(dest: HTMLElement) {
        super(dest);

        this.pan = new Pan(this);
        this.selection = new Selection(this);
        this.drag = new Drag(this);
        this.linkCreate = new LinkCreate(this);
        this.linkRemove = new LinkRemove(this);


        document.addEventListener('keydown', e => this.handlerKeyDown(e));
        document.addEventListener('keyup', e => this.handlerKeyUp(e));

        //@ts-ignore
        window.removeConnection = this.removeConnection;

        console.log('!!')
    }

    public setMode(mode: string): void {
        if (this.mode == '') this.mode = mode;
        console.log(this.mode)
    }

    public isMode(mode: string): boolean {
        return this.mode == mode;
    }

    public resetMode(mode: string): void {
        if (this.mode == mode) this.mode = '';
    }

    public createNode(
        x: number = 50, y: number = 50,
        quantIn: number = 2, quantOut: number = 2,
        node: string = 'empty', id: string = getID()
    ) {

        const r: number = 4;
        const offEdge: number = 8;
        const step: number = 8;
        const rx: number = 2;

        const maxQuant: number = Math.max(quantIn, quantOut);
        let width = 80;
        let height = offEdge + maxQuant * (r * 2 + step);

        const inX: number = 0;//r + offEdge;
        const inY: number = height * .5 - quantIn * (r * 2 + step) * .5 + step;
        const outX: number = width;// - r - offEdge;
        const outY: number = height * .5 - quantOut * (r * 2 + step) * .5 + step;

        const fillIn: string = '#bcffd6';
        const fillOut: string = '#ffc69a';
        const fillNode: string = '#d7d7d7';
        const stroke: string = '#25334b';

        const nodeGroup = this.group({x, y, class: NodeSelector.node, data: {node}});
        const nodeRect = this.rectangle({
            x: 0, y: 0, width, height, rx,
            stroke, fill: fillNode,
            to: nodeGroup,
            class: NodeSelector.handle
        });
        nodeGroup.id = id;

        for (let i = 0, offY = 0; i < quantIn; i++, offY += r * 2 + step) {
            this.circle(
                {
                    cx: inX, cy: inY + offY, r, stroke, fill: fillIn,
                    to: nodeGroup, class: [NodeSelector.pinIn],
                    id: getID()
                });
        }
        for (let i = 0, offY = 0; i < quantOut; i++, offY += r * 2 + step) {
            this.circle(
                {
                    cx: outX, cy: outY + offY, r, stroke, fill: fillOut,
                    to: nodeGroup, class: [NodeSelector.pinOut],
                    id: getID()
                });
        }
    }

    private handlerKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        this.key[e.code.toLowerCase()] = true;
        if (this.key['escape']) this.resetMode(this.mode);
        // console.log(this.key)
    }

    private handlerKeyUp(e: KeyboardEvent) {
        this.key[e.code.toLowerCase()] = false;
    }
}

const nui = new NodeUI(document.querySelector('.canvas'))
nui.createNode(50, 50, 0, 1, 'value')
nui.createNode(50, 80, 0, 1, 'value')
nui.createNode(200, 50, 2, 1, 'sum')

// nui.createNode(50, 150, 0, 1, 'value')
// nui.createNode(50, 180, 0, 1, 'value')
// nui.createNode(200, 150, 2, 1, 'sum')
