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
    pinText: 'pin-text',
}

interface INodeParam {
    x?: number;
    y?: number;
    width?: number;
    node?: string;
    arrIn?: string[];
    arrOut?: string[];
    id?: string;
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

    public createNode({x = 50, y = 50, width = 0, node = 'empty', arrIn = [], arrOut = [], id = getID()}: INodeParam) {
        const quantIn: number = arrIn.length;
        const quantOut: number = arrOut.length;

        const r: number = 4;
        const offEdge: number = 8;
        const step: number = 8;
        const rx: number = 2;

        const maxQuant: number = Math.max(quantIn, quantOut);

        let arrWidthIn = arrIn.length ? arrIn.map(it => this.calculateTextWidth(it, NodeSelector.pinText)) : [0];
        let arrWidthOut = arrOut.length ? arrOut.map(it => this.calculateTextWidth(it, NodeSelector.pinText)) : [0];
        const maxWidthIn: number = Math.max(...arrWidthIn)
        const maxWidthOut: number = Math.max(...arrWidthOut)

        console.log(maxWidthIn, maxWidthOut)
        let maxWidth = maxWidthIn + maxWidthOut + offEdge * 3 + width;
        let height = offEdge + maxQuant * (r * 2 + step);

        const inX: number = 0;//r + offEdge;
        const inY: number = height * .5 - quantIn * (r * 2 + step) * .5 + step;
        const outX: number = maxWidth;// - r - offEdge;
        const outY: number = height * .5 - quantOut * (r * 2 + step) * .5 + step;

        const fillIn: string = '#bcffd6';
        const fillOut: string = '#ffc69a';
        const fillNode: string = '#d7d7d7';
        const stroke: string = '#25334b';

        const nodeGroup = this.group({x, y, class: NodeSelector.node, data: {node}});
        const nodeRect = this.rectangle({
            x: 0, y: 0, width: maxWidth, height, rx,
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
            this.text({
                x: inX + offEdge, y: inY + offY + 3,
                text: arrIn[i],
                to: nodeGroup, class: [NodeSelector.pinText],
            })
        }
        for (let i = 0, offY = 0; i < quantOut; i++, offY += r * 2 + step) {
            this.circle(
                {
                    cx: outX, cy: outY + offY, r, stroke, fill: fillOut,
                    to: nodeGroup, class: [NodeSelector.pinOut],
                    id: getID()
                });
            this.text({
                x: outX - offEdge - arrWidthOut[i], y: outY + offY + 3,
                text: arrOut[i],
                to: nodeGroup, class: [NodeSelector.pinText],
            })
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
//language=HTML
// nui.svg.innerHTML = '<text x="0" y="0" class="pinText" opacity="0">out</text><g x="50" y="50" class="node" data-node="value" transform="translate(50,50)" id="ufFCx6a"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6c" data-to="ufFCx6i"></circle><text x="16" y="15" class="pinText">out</text></g><g x="50" y="80" class="node" data-node="value" transform="translate(50,80)" id="ufFCx6d"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6f" data-to="ufFCx6j"></circle><text x="16" y="15" class="pinText">out</text></g><g x="120" y="50" class="node" data-node="sum" transform="translate(120,50)" id="ufFCx6g"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufFCx6i" data-to="ufFCx6c"></circle><text x="8" y="15" class="pinText">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufFCx6j" data-to="ufFCx6f"></circle><text x="8" y="31" class="pinText">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6k"></circle><text x="24" y="23" class="pinText">out</text></g><path class="link" stroke-linecap="round" d="M87.0107421875 62 C 98.00716145833333 62, 109.00358072916667 62, 120 62" id="ufFCx6c-ufFCx6i"></path><path class="link" stroke-linecap="round" d="M120 78 C 109.00358072916667 78, 98.00716145833333 92, 87.0107421875 92" id="ufFCx6f-ufFCx6j"></path>'

nui.createNode({x: 50, y: 50, node: 'value', arrOut: ['out']})
nui.createNode({x: 50, y: 80, node: 'value', arrOut: ['out']})
nui.createNode({x: 120, y: 50, node: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})

// nui.createNode(50, 150, 0, 1, 'value')
// nui.createNode(50, 180, 0, 1, 'value')
// nui.createNode(200, 150, 2, 1, 'sum')

let btnRun = document.querySelector('#cmd-run');
new Calc(nui, btnRun);