import {Svg} from "./svg.js";
import {getID} from "./utils.js";
import {EditorLinkCreate} from "./editor.link-create.js";
import {EditorLinkRemove} from "./editor.link-remove.js";
import {EditorDrag} from "./editor.drag.js";
import {EditorSelection} from "./editor.selection.js";
import {EditorPan} from "./editor.pan.js";
import {Calc} from "./calc.js";

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

    private selection: EditorSelection;
    private linkCreate: EditorLinkCreate;
    private linkRemove: EditorLinkRemove;
    private drag: EditorDrag;
    private pan: EditorPan;
    private calc: Calc;

    constructor(dest: HTMLElement) {
        super(dest);

        //building editor
        this.pan = new EditorPan(this);
        this.selection = new EditorSelection(this);
        this.drag = new EditorDrag(this);
        this.linkCreate = new EditorLinkCreate(this);
        this.linkRemove = new EditorLinkRemove(this);

        document.addEventListener('keydown', e => this.handlerKeyDown(e));
        document.addEventListener('keyup', e => this.handlerKeyUp(e));

        //@ts-ignore
        window.removeConnection = this.removeConnection;
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
        this.key[e.code.toLowerCase()] = true;
        if (this.key['escape']) this.resetMode(this.mode);
        // console.log(this.key)
        if (!this.key['f5']) e.preventDefault();
    }

    private handlerKeyUp(e: KeyboardEvent) {
        this.key[e.code.toLowerCase()] = false;
    }
}

const nui = new NodeUI(document.querySelector('.canvas'))
nui.svg.innerHTML = '<g x="50" y="50" class="node" data-node="value" transform="translate(50,50)" id="ufv10Ga"><rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Gc" data-to="ufv10Gg"></circle></g><g x="50" y="80" class="node" data-node="value" transform="translate(50,80)" id="ufv10Gd"><rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Ge" data-to="ufv10Gh"></circle></g><g x="200" y="50" class="node selected" data-node="sum" transform="translate(161,58)" id="ufv10Gf"><rect x="0" y="0" width="80" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufv10Gg" data-to="ufv10Gc"></circle><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufv10Gh" data-to="ufv10Ge"></circle><circle cx="80" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Gi"></circle></g><path class="link" stroke-linecap="round" d="M130 62 C 140.33333333333334 62, 150.66666666666666 70, 161 70" id="ufv10Gc-ufv10Gg"></path><path class="link" stroke-linecap="round" d="M130 92 C 140.33333333333334 92, 150.66666666666666 86, 161 86" id="ufv10Ge-ufv10Gh"></path>'

// nui.createNode(50, 50, 0, 1, 'value')
// nui.createNode(50, 80, 0, 1, 'value')
// nui.createNode(200, 50, 2, 1, 'sum')

// nui.createNode(50, 150, 0, 1, 'value')
// nui.createNode(50, 180, 0, 1, 'value')
// nui.createNode(200, 150, 2, 1, 'sum')

let btnRun = document.querySelector('#cmd-run');
new Calc(nui, btnRun);