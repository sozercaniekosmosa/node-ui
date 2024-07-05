import {Point, Svg} from "./svg";
import {getID} from "./utils";
import {EditorLinkCreate} from "./editor/editor.link-create";
import {EditorLinkRemove} from "./editor/editor.link-remove";
import {EditorDrag} from "./editor/editor.drag";
import {EditorSelection} from "./editor/editor.selection";
import {EditorPan} from "./editor/editor.pan";

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

interface TNodeParam {
    x?: number;
    y?: number;
    widthEmpty?: number;
    nodeName?: string;
    arrIn?: string[];
    arrOut?: string[];
    id?: string;
    data?: object;
    color?: string;
}

type TKey = Record<string, boolean>;

export class NodeUI extends Svg {
    private mode: string = '';
    public key: TKey = {};

    private selection: EditorSelection;
    private linkCreate: EditorLinkCreate;
    private linkRemove: EditorLinkRemove;
    private drag: EditorDrag;
    private pan: EditorPan;

    // private calc: Calc;

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
        // console.log(this.mode)
    }

    public isMode(mode: string): boolean {
        return this.mode == mode;
    }

    public resetMode(mode: string): void {
        if (this.mode == mode) this.mode = '';
    }

    public createNode(
        {
            x = 50, y = 50, widthEmpty = 0, nodeName = 'empty',
            arrIn = [], arrOut = [], id = getID(), data,
            color = '#d7d7d7'
        }: TNodeParam) {
        const numberIn: number = arrIn!.length;
        const numberOut: number = arrOut!.length;

        const r: number = 4;
        const offEdge: number = 8;
        const step: number = 8;
        const rx: number = 2;

        const maxNumber: number = Math.max(numberIn, numberOut);

        let arrWidthIn = arrIn?.length ? arrIn.map(it => this.calculateTextBox(it, NodeSelector.pinText).width) : [0];
        let arrWidthOut = arrOut?.length ? arrOut.map(it => this.calculateTextBox(it, NodeSelector.pinText).width) : [0];
        const maxWidthIn: number = Math.max(...arrWidthIn)
        const maxWidthOut: number = Math.max(...arrWidthOut)
        const boxNodeDesc: DOMRect = this.calculateTextBox(nodeName!, NodeSelector.pinText)

        let width = Math.max(maxWidthIn + maxWidthOut + offEdge * 3 + widthEmpty, boxNodeDesc.width);
        let height = offEdge + maxNumber * (r * 2 + step);

        const inX: number = 0;//r + offEdge;
        const inY: number = height * .5 - numberIn * (r * 2 + step) * .5 + step;
        const outX: number = width;// - r - offEdge;
        const outY: number = height * .5 - numberOut * (r * 2 + step) * .5 + step;

        const fillIn: string = '#bcffd6';
        const fillOut: string = '#ffc69a';
        const fillNode: string = color;
        const stroke: string = '#25334b';

        const nodeGroup = this.group({x, y, class: NodeSelector.node, data: {node: nodeName, ...data}});

        this.rectangle({
            x: 0, y: 0, width, height, rx,
            stroke, fill: fillNode,
            to: nodeGroup,
            class: NodeSelector.handle,
        });
        nodeGroup.id = id!;

        for (let i = 0, offY = 0; i < numberIn; i++, offY += r * 2 + step) {
            this.circle(
                {
                    cx: inX, cy: inY + offY, r, stroke, fill: fillIn,
                    to: nodeGroup, class: [NodeSelector.pinIn],
                    id: getID(), data: {name: arrIn?.[i]}
                });
            this.text({
                x: inX + offEdge, y: inY + offY + 3,
                text: arrIn?.[i],
                to: nodeGroup, class: [NodeSelector.pinText],
            })
        }
        for (let i = 0, offY = 0; i < numberOut; i++, offY += r * 2 + step) {
            this.circle(
                {
                    cx: outX, cy: outY + offY, r, stroke, fill: fillOut,
                    to: nodeGroup, class: [NodeSelector.pinOut],
                    id: getID(), data: {name: arrOut?.[i]}
                });
            this.text({
                x: outX - offEdge - arrWidthOut[i], y: outY + offY + 3,
                text: arrOut?.[i],
                to: nodeGroup, class: [NodeSelector.pinText],
            })
        }

        this.text({
            x: 0, y: -2,
            text: nodeName,
            to: nodeGroup, class: [NodeSelector.pinText],
        })

        return nodeGroup;
    }

    public removeNode() {
        let didRemove = false;
        [...this.svg.querySelectorAll('.' + NodeSelector.selected)].forEach(node => {
            node = node.closest('.' + NodeSelector.node);
            const arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn)].map(it => it.dataset.to + '-' + it.id);
            const arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut)].map(it => it.id + '-' + it.dataset.to);
            let arrPath = [...arrIn, ...arrOut];
            const ids = '#' + arrPath.join(',#');
            [...this.svg.querySelectorAll(ids)].forEach(d => this.linkRemove.removeNode(d as SVGElement))
            this.svg.removeChild(node as Element);
            didRemove = true;
        })

        if (didRemove) this.svg.dispatchEvent(new CustomEvent('node-remove', {detail: {}}));
    }

    private handlerKeyDown(e: KeyboardEvent) {
        this.key[e.code.toLowerCase()] = true;
        if (this.key['escape']) this.resetMode(this.mode);
        // console.log(this.key)
        if (this.key['f5'] || this.key['f12']) return
        // e.preventDefault();
        document.dispatchEvent(new CustomEvent('svgkeydown', {detail: {...this.key}}))
    }

    private handlerKeyUp(e: KeyboardEvent) {
        this.key[e.code.toLowerCase()] = false;
        document.dispatchEvent(new CustomEvent('svgkeyup', {detail: {...this.key}}))
    }
}