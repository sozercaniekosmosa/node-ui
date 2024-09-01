import {Svg} from "./svg";
import {compressString, getID} from "../../utils";
import {EditorLinkCreate} from "./editor/editor.link-create";
import {EditorLinkRemove} from "./editor/editor.link-remove";
import {EditorDrag} from "./editor/editor.drag";
import {EditorSelection} from "./editor/editor.selection";
import {EditorPan} from "./editor/editor.pan";

export const NodeSelector = {
    selectionRect: 'selection-rect',
    selected: 'selected',
    node: 'node',
    path: 'group-path',
    handle: 'handle',
    link: 'link',
    linkRemove: 'link-remove',
    pinIn: 'pin-in',
    pinOut: 'pin-out',
    nodeText: 'node-text',
}

interface TNodeParam {
    x?: number;
    y?: number;
    nodeName?: string;
    arrIn?: string[];
    arrOut?: string[];
    arrButton?: string[];
    id?: string;
    cfg?: object;
    color?: string;
}

type TKey = Record<string, boolean>;

export class NodeUI extends Svg {
    private mode: string = '';
    public key: TKey = {};

    public selection: EditorSelection;
    private linkCreate: EditorLinkCreate;
    private linkRemove: EditorLinkRemove;
    private drag: EditorDrag;
    private pan: EditorPan;

    // private calc: Calc;

    constructor(dest: HTMLElement) {
        super(dest);
        this.group({class: NodeSelector.path})

        //building editor
        this.pan = new EditorPan(this);
        this.selection = new EditorSelection(this);
        this.drag = new EditorDrag(this);
        this.linkCreate = new EditorLinkCreate(this);
        this.linkRemove = new EditorLinkRemove(this);

        // document.addEventListener('keydown', e => this.handlerKeyDown(e));
        // document.addEventListener('keyup', e => this.handlerKeyUp(e));

        this.svg.addEventListener('click', ({target}) => {
            try {
                const node = (target as HTMLElement).closest<HTMLElement>('.' + NodeSelector.node)
                const id = node.id;
                const {cmd} = (target as HTMLElement).dataset;
                this.svg.dispatchEvent(new CustomEvent('node-cmd', {detail: {cmd, id}}));
            } catch (e) {

            }
        })
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

    public createNode(nodeParam: TNodeParam) {
        const {
            x = 50, y = 50, nodeName = 'empty',
            arrIn = [], arrOut = [], id = getID(), cfg,
            color = '#d7d7d7', arrButton,
        } = nodeParam

        let midWidth = 0;
        let midHeight = 0;
        let midDimCalc: DOMRect;
        let midHtml = ''

        const numberIn: number = arrIn!.length;
        const numberOut: number = arrOut!.length;

        const r: number = 4;
        const offEdge: number = 8;
        const step: number = 8;
        const rx: number = 2;

        const maxNumber: number = Math.max(numberIn, numberOut);

        let arrDimIn = arrIn?.length ? arrIn.map(it => this.calculateTextBox(it, NodeSelector.nodeText)) : [];
        let arrDimOut = arrOut?.length ? arrOut.map(it => this.calculateTextBox(it, NodeSelector.nodeText)) : [];
        let arrWidthIn = arrDimIn?.length ? arrDimIn.map(it => it.width) : [0];
        let arrWidthOut = arrDimOut?.length ? arrDimOut.map(it => it.width) : [0];
        const maxWidthIn: number = Math.max(...arrWidthIn)
        const maxWidthOut: number = Math.max(...arrWidthOut)
        const boxNodeDesc: DOMRect = this.calculateTextBox(nodeName!, NodeSelector.nodeText)

        if (arrButton) {
            arrButton.forEach(item => midHtml += `<button data-cmd="${item}">${item}</button>`);

            midDimCalc = this.calculateHtmlBox(`<div class="button-panel">${midHtml}</div>`)
            midWidth = midDimCalc.width;
            midHeight = midDimCalc.height;
        }

        let width = Math.max(maxWidthIn + maxWidthOut + offEdge * 4 + midWidth, boxNodeDesc.width);
        let height = Math.max(offEdge + maxNumber * (r * 2 + step), midHeight);

        const inX: number = 0;//r + offEdge;
        const inY: number = height * .5 - numberIn * (r * 2 + step) * .5 + step;
        const outX: number = width;// - r - offEdge;
        const outY: number = height * .5 - numberOut * (r * 2 + step) * .5 + step;

        const fillIn: string = '#bcffd6';
        const fillOut: string = '#ffc69a';
        const fillNode: string = color!;
        const stroke: string = '#25334b';

        const nodeGroup = this.group({x, y, class: NodeSelector.node, data: {nodeName, cfg: compressString(JSON.stringify(cfg))}});

        this.rectangle({x: 0, y: 0, width, height, rx, stroke, fill: fillNode, to: nodeGroup, class: NodeSelector.handle,});
        nodeGroup.id = id!;

        if (arrButton) {
            let nodeEmbed = this.createElement('foreignObject', {
                x: maxWidthIn + offEdge * 2, y: (height - midHeight) * .5, width: midWidth, height: midHeight,
                to: nodeGroup, class: ['svg-embed']
            })

            let div = this.createElement('div', {
                data: {id}, to: nodeEmbed, class: ['button-panel']
            }, 'http://www.w3.org/1999/xhtml')
            div.innerHTML = midHtml;
        }

        for (let i = 0, offY = 0; i < numberIn; i++, offY += r * 2 + step) {
            const idIn = getID();
            const nodeConnectorIn = this.circle(
                {
                    cx: inX, cy: inY + offY, r, stroke, fill: fillIn,
                    to: nodeGroup, class: [NodeSelector.pinIn],
                    id: idIn, data: {name: arrIn?.[i]}
                });
            this.text({
                x: inX + offEdge, y: inY + offY + 1,
                text: arrIn?.[i],
                to: nodeGroup, class: [NodeSelector.nodeText],
                alignmentBaseline: 'middle'
            })
        }
        for (let i = 0, offY = 0; i < numberOut; i++, offY += r * 2 + step) {
            const idOut = getID();
            const nodeConnectorOut = this.circle(
                {
                    cx: outX, cy: outY + offY, r, stroke, fill: fillOut,
                    to: nodeGroup, class: [NodeSelector.pinOut],
                    id: idOut, data: {name: arrOut?.[i]}
                });
            this.text({
                x: outX - offEdge - arrWidthOut[i], y: outY + offY + 1,
                text: arrOut?.[i],
                to: nodeGroup, class: [NodeSelector.nodeText],
                alignmentBaseline: 'middle'
            })
        }

        this.text({
            x: 0, y: -2,
            text: nodeName,
            to: nodeGroup, class: [NodeSelector.nodeText],
        })

        return nodeGroup;
    }

    public removeNode() {
        let didRemove = false;
        [...this.svg.querySelectorAll('.' + NodeSelector.selected)].forEach(node => {
            node = node.closest('.' + NodeSelector.node);
            const arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn)].map((it: HTMLElement) => it.dataset.to + '-' + it.id);
            const arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut)].map((it: HTMLElement) => it.id + '-' + it.dataset.to);
            let arrPath = [...arrIn, ...arrOut];
            const ids = '#' + arrPath.join(',#');
            [...this.svg.querySelectorAll(ids)].forEach(d => this.linkRemove.removeNode(d as SVGElement))
            this.svg.removeChild(node as Element);
            didRemove = true;
        })

        if (didRemove) this.svg.dispatchEvent(new CustomEvent('node-remove', {detail: {}}));
    }

    // private handlerKeyDown(e: KeyboardEvent) {
    //     this.key[e.code.toLowerCase()] = true;
    //     if (this.key['escape']) this.resetMode(this.mode);
    //     // console.log(this.key)
    //     if (this.key['f5'] || this.key['f12']) return
    //     document.dispatchEvent(new CustomEvent('svgkeydown', {detail: {...this.key}}))
    // }
    //
    // private handlerKeyUp(e: KeyboardEvent) {
    //     this.key[e.code.toLowerCase()] = false;
    //     document.dispatchEvent(new CustomEvent('svgkeyup', {detail: {...this.key}}))
    // }
}