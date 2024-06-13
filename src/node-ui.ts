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
// nui.svg.innerHTML = '<g x="50" y="50" class="node" data-node="value" transform="translate(50,50)" id="ufv10Ga"><rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Gc" data-to="ufv10Gg"></circle></g><g x="50" y="80" class="node" data-node="value" transform="translate(50,80)" id="ufv10Gd"><rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Ge" data-to="ufv10Gh"></circle></g><g x="200" y="50" class="node selected" data-node="sum" transform="translate(161,58)" id="ufv10Gf"><rect x="0" y="0" width="80" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufv10Gg" data-to="ufv10Gc"></circle><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufv10Gh" data-to="ufv10Ge"></circle><circle cx="80" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufv10Gi"></circle></g><path class="link" stroke-linecap="round" d="M130 62 C 140.33333333333334 62, 150.66666666666666 70, 161 70" id="ufv10Gc-ufv10Gg"></path><path class="link" stroke-linecap="round" d="M130 92 C 140.33333333333334 92, 150.66666666666666 86, 161 86" id="ufv10Ge-ufv10Gh"></path>'
//language=HTML                   
nui.svg.innerHTML = `
    <g x="50" y="50" class="node" data-node="value" transform="translate(50,50)" id="ufzP1IF">
        <rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1II"
                data-to="ufzP1IO ufzP1IW ufzP1IX"></circle>
    </g>
    <g x="50" y="80" class="node" data-node="value" transform="translate(50,80)" id="ufzP1IJ">
        <rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1IK"
                data-to="ufzP1IM ufzP1IX ufzP1IO ufzP1IW"></circle>
    </g>
    <g x="200" y="50" class="node" data-node="sum" transform="translate(200,50)" id="ufzP1IL">
        <rect x="0" y="0" width="80" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufzP1IM"
                data-to="ufzP1IK ufzP1IS ufzP1IU"></circle>
        <circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufzP1IO"
                data-to="ufzP1II ufzP1IU ufzP1IS ufzP1IK"></circle>
        <circle cx="80" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1IP"></circle>
    </g>
    <g x="50" y="150" class="node" data-node="value" transform="translate(45,140)" id="ufzP1IQ">
        <rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1IS"
                data-to="ufzP1IW ufzP1IO ufzP1IM ufzP1IX"></circle>
    </g>
    <g x="50" y="180" class="node" data-node="value" transform="translate(50,180)" id="ufzP1IT">
        <rect x="0" y="0" width="80" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="80" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1IU"
                data-to="ufzP1IO ufzP1IX ufzP1IW ufzP1IM"></circle>
    </g>
    <g x="200" y="150" class="node selected" data-node="sum" transform="translate(194,159)" id="ufzP1IV">
        <rect x="0" y="0" width="80" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect>
        <circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufzP1IW"
                data-to="ufzP1II ufzP1IS ufzP1IU ufzP1IK"></circle>
        <circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufzP1IX"
                data-to="ufzP1IK ufzP1II ufzP1IU ufzP1IS"></circle>
        <circle cx="80" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufzP1IY"></circle>
    </g>
    <path class="link" stroke-linecap="round" d="M130 62 C 153.33333333333334 62, 176.66666666666666 78, 200 78"
          id="ufzP1II-ufzP1IO"></path>
    <path class="link" stroke-linecap="round" d="M200 62 C 176.66666666666666 62, 153.33333333333334 92, 130 92"
          id="ufzP1IK-ufzP1IM"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 61.99998654259571 C 151.3333518240188 61.99998654259571, 172.6667110655044 171.00000847710498, 194.00007030698998 171.00000847710498"
          id="ufzP1II-ufzP1IW"></path>
    <path class="link" stroke-linecap="round" d="M130 192 C 153.33333333333334 192, 176.66666666666666 78, 200 78"
          id="ufzP1IU-ufzP1IO"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 91.99996866120227 C 151.3333518240188 91.99996866120227, 172.6667110655044 186.99999894036182, 194.00007030698998 186.99999894036182"
          id="ufzP1IK-ufzP1IX"></path>
    <path class="link" stroke-linecap="round"
          d="M125.0000245306228 151.99999083413013 C 148.00003978941186 151.99999083413013, 171.00005504820092 171.00000847710498, 194.00007030698998 171.00000847710498"
          id="ufzP1IS-ufzP1IW"></path>
    <path class="link" stroke-linecap="round" d="M125 152 C 150 152, 175 78, 200 78" id="ufzP1IS-ufzP1IO"></path>
    <path class="link" stroke-linecap="round" d="M125 152 C 150 152, 175 62, 200 62" id="ufzP1IS-ufzP1IM"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 61.99998654259571 C 151.3333518240188 61.99998654259571, 172.6667110655044 186.99999894036182, 194.00007030698998 186.99999894036182"
          id="ufzP1II-ufzP1IX"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 191.99996699227222 C 151.3333518240188 191.99996699227222, 172.6667110655044 186.99999894036182, 194.00007030698998 186.99999894036182"
          id="ufzP1IU-ufzP1IX"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 191.99996699227222 C 151.3333518240188 191.99996699227222, 172.6667110655044 171.00000847710498, 194.00007030698998 171.00000847710498"
          id="ufzP1IU-ufzP1IW"></path>
    <path class="link" stroke-linecap="round"
          d="M125.0000245306228 151.99999083413013 C 148.00003978941186 151.99999083413013, 171.00005504820092 186.99999894036182, 194.00007030698998 186.99999894036182"
          id="ufzP1IS-ufzP1IX"></path>
    <path class="link" stroke-linecap="round" d="M130 92 C 153.33333333333334 92, 176.66666666666666 78, 200 78"
          id="ufzP1IK-ufzP1IO"></path>
    <path class="link" stroke-linecap="round"
          d="M129.9999925825332 91.99996866120227 C 151.3333518240188 91.99996866120227, 172.6667110655044 171.00000847710498, 194.00007030698998 171.00000847710498"
          id="ufzP1IK-ufzP1IW"></path>
    <path class="link" stroke-linecap="round" d="M130 192 C 153.33333333333334 192, 176.66666666666666 62, 200 62"
          id="ufzP1IU-ufzP1IM"></path>`

// nui.createNode(50, 50, 0, 1, 'value')
// nui.createNode(50, 80, 0, 1, 'value')
// nui.createNode(200, 50, 2, 1, 'sum')
//
// nui.createNode(50, 150, 0, 1, 'value')
// nui.createNode(50, 180, 0, 1, 'value')
// nui.createNode(200, 150, 2, 1, 'sum')

let btnRun = document.querySelector('#cmd-run');
new Calc(nui, btnRun);