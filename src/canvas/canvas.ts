import {TPoint, Svg, Point, TMouseEvent} from "../svg.js";
import {Selection} from "./selection.js";
import {Link} from "./link.js";

export type TViewBox = {
    x: number,
    y: number,
    height: number
    width: number
}

export const NodeSelector = {
    selected: 'selected',
    node: 'node',
    handle: 'handle',
    link: 'link',
    linkRemove: 'link-remove',
    pinIn: 'pin-in',
    pinOut: 'pin-out',
}

export class CanvasNodeUi {
    private width: number = 0;
    private height: number = 0;

    private viewBox: TViewBox = {x: 0, y: 0, width: 0, height: 0};
    private isPanning = false;
    private isRemoving = false;
    private mouseDownPoint: Point = new Point(0, 0);
    private isPressSpace = false;
    private isPressAlt = false;
    private dragTarget: Element | boolean = false;
    private clickTarget: Element | boolean = false;

    private arrSelected: Element[] = [];
    private selection: Selection;
    private readonly svgNode: SVGElement;
    private link: Link;

    constructor(private svg: Svg) {
        this.svgNode = this.svg.node
        this.createNodeUICanvas();
        this.selection = new Selection(this.svg);
        this.link = new Link(this.svg);
    }

    private createNodeUICanvas() {

        this.width = Number(this.svgNode.getAttribute('width'));
        this.height = Number(this.svgNode.getAttribute('height'));

        this.viewBox = {x: 0, y: 0, width: this.width, height: this.height};

        this.svgNode.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);

        document.addEventListener('keydown', e => this.handlerKeyDown(e));
        document.addEventListener('keyup', e => this.handlerKeyUp(e));
        this.svgNode.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svgNode.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svgNode.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
    }

    private handlerKeyUp(e: KeyboardEvent) {
        if (e.code === "Space") {
            this.isPressSpace = false;
        } else if (e.code === "AltLeft") {
            this.isPressAlt = false;
        }
    }

    private handlerKeyDown(e: KeyboardEvent) {

        if (e.code === "Space") {
            this.isPressSpace = true;
        } else if (e.code === "AltLeft") {
            this.isPressAlt = true;
        }
    }

    private handlerMouseUp(e: TMouseEvent) {
        this.link.handlerMouseUpLink(e);
        this.link.handlerMouseUpRemove(e);
        this.selection.clearRectSelection();
        this.isPanning = false;
        this.isRemoving = false;
        this.dragTarget = false;
    }

    private handlerMouseDown(e: TMouseEvent) {
        const {delta: d, start: s, p, target} = e;

        this.clickTarget = (target as Element);
        const targetDown = this.clickTarget.closest('.' + NodeSelector.node);
        const isHandle = this.clickTarget.classList.contains(NodeSelector.handle);
        const isSvg = target === this.svgNode;

        this.link.handlerMouseDownLink(e);

        if (this.isPressSpace) { //pan
            this.isPanning = true;
        } else if (this.isPressAlt) { //remove
            this.isRemoving = true;
            this.link.handlerMouseDownRemove(e);
        } else if (targetDown && isHandle) { //select
            this.dragTarget = targetDown;
            this.mouseDownPoint = this.selection.startSelection(p.x, p.y);
            this.arrSelected = this.selection.getSelected(this.dragTarget, s.x, s.y, p.x, p.y);
        } else if (isSvg) {//reset|new selection
            this.mouseDownPoint = this.selection.startSelection(p.x, p.y);
            this.selection.clearSelection();
        }

        this.mouseDownPoint = p;
    }

    private handlerMouseMove(e: TMouseEvent) {
        const {delta: d, start: s, p} = e;
        let {x: vx, y: vy, width: vw, height: vh} = this.svg.getView();
        let {x: dx, y: dy} = d.mul(vw / this.svg.width, vh / this.svg.height)

        if (this.isPanning && this.isPressSpace) { //paning
            this.svg.setView(vx - dx, vy - dy, vw, vh)
        } else if (this.isRemoving && this.isPressAlt) { //removing
            this.link.handlerMouseMoveRemove(e);
        } else if (this.dragTarget) {//drag node
            this.arrSelected.forEach(node => {
                let {x, y} = this.svg.getTransformPoint(node as SVGElement);
                node.setAttribute('transform', `translate(${x + dx},${y + dy})`);
            })
        } else {
            this.arrSelected = this.selection.getSelected(this.dragTarget as Element, s.x, s.y, p.x, p.y);
        }
        this.link.handlerMouseMoveLink(e);
    }
}