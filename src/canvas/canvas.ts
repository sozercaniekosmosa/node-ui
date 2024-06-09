import {IPoint, Svg, Point} from "../svg.js";
import {Selection} from "./selection.js";
import {Link} from "./link.js";

export type TViewBox = {
    x: number,
    y: number,
    height: number
    width: number
}

export const ObjectState = {
    selected: 'selected',
    node: 'node',
    handle: 'handle',
    rect: 'rect',
    link: 'link',
    pinIn: 'pin-in',
    pinOut: 'pin-out',
}

export class CanvasNodeUi {
    private width: number = 0;
    private height: number = 0;

    private viewBox: TViewBox = {x: 0, y: 0, width: 0, height: 0};
    private isPanning = false;
    private mouseDownPoint: Point = new Point(0, 0);
    private isPressSpace = false;
    private dragTarget: Element | boolean = false;
    private clickTarget: Element | boolean = false;

    private arrSelected: Element[] = [];
    private _pos: IPoint | false = false;
    private pos: Point = new Point({x: 0, y: 0});
    private deltaPos: Point = new Point({x: 0, y: 0});
    private selection: Selection;
    private svgNode: SVGElement;
    private link: Link;

    constructor(private svg: Svg) {
        this.svgNode = this.svg.node
        this.createNodeUICanvas();
        this.selection = new Selection(this.svg);
        this.link = new Link(this.svg)
    }

    private createNodeUICanvas() {

        this.width = Number(this.svgNode.getAttribute('width'));
        this.height = Number(this.svgNode.getAttribute('height'));

        this.viewBox = {x: 0, y: 0, width: this.width, height: this.height};

        this.svgNode.setAttribute('viewBox', `${this.viewBox.x} ${this.viewBox.y} ${this.viewBox.width} ${this.viewBox.height}`);

        document.addEventListener('keydown', e => this.handlerKeyDown(e));
        document.addEventListener('keyup', e => this.handlerKeyUp(e));
        this.svgNode.addEventListener('wheel', e => this.handlerMouseWheel(e));
        this.svgNode.addEventListener('mousedown', e => this.handlerMouseDown(e));
        this.svgNode.addEventListener('mouseup', (e) => this.handlerMouseUp(e));
        this.svgNode.addEventListener('mousemove', e => this.handlerMouseMove(e));
    }

    private handlerKeyUp(e: KeyboardEvent) {
        if (e.code === "Space") {
            this.isPressSpace = false;
        }
    }

    private handlerKeyDown(e: KeyboardEvent) {
        if (e.code === "Space") {
            this.isPressSpace = true;
        }
    }


    private handlerMouseUp(e) {
        this.link.handlerMouseUp(e);
        this.selection.clearSelection();
        this.isPanning = false;
        this.dragTarget = false;
    };


    private handlerMouseWheel(e: WheelEvent) {
        e.preventDefault();
        const zoomFactor = 1.3;
        const {offsetX, offsetY, deltaY} = e;

        const offset = new Point(offsetX, offsetY);
        const zoomDirection = deltaY < 0 ? 1 / zoomFactor : zoomFactor;
        let {x, width, y, height} = this.svg.getView()
        const mp = new Point(offset.x, offset.y).mul(1 / this.svgNode.clientWidth, 1 / this.svgNode.clientHeight).mul(width, height).add(x, y)
        width *= zoomDirection;
        height *= zoomDirection;
        x = mp.x - (offsetX / this.svgNode.clientWidth) * width;
        y = mp.y - (offsetY / this.svgNode.clientHeight) * height;
        this.svg.setView(x, y, width, height)
    };

    private handlerMouseDown(e: MouseEvent) {
        this.clickTarget = (e.target as Element);
        const target = this.clickTarget.closest('.' + ObjectState.node);
        const isHandle = this.clickTarget.classList.contains(ObjectState.handle);
        const isSvg = e.target === this.svgNode;

        this.link.handlerMouseDown(e);

        if (this.isPressSpace) { //pan
            this.isPanning = true;
        } else if (target && isHandle) { //select
            this.dragTarget = target;
            this.mouseDownPoint = this.selection.startSelection(e.clientX, e.clientY);
            if (!this.dragTarget.classList.contains(ObjectState.selected)) {
                this.arrSelected.forEach(el => el.classList.remove(ObjectState.selected));
                this.arrSelected = [];
            }
            this.arrSelected = this.getSelection(e);
        } else if (isSvg) {//reset|new selection
            this.mouseDownPoint = this.selection.startSelection(e.clientX, e.clientY);
            this.arrSelected.forEach(el => el.classList.remove(ObjectState.selected));
            this.arrSelected = [];
        }

        this.mouseDownPoint = new Point({x: e.clientX, y: e.clientY});
    };

    private handlerMouseMove(e: MouseEvent) {

        if (!this._pos) this._pos = {x: e.clientX, y: e.clientY};
        this.pos = this.pos.set({x: e.clientX, y: e.clientY});
        this.deltaPos = this.pos.clone().add(-this._pos.x, -this._pos.y);
        this._pos = this.pos.point();

        let {x, y, width, height} = this.svg.getView()
        let {x: dx, y: dy} = this.deltaPos.mul(width / this.svg.width, height / this.svg.height)

        if (this.isPanning && this.isPressSpace) { //paning
            this.svg.setView(x - dx, y - dy, width, height)
        } else if (this.dragTarget) {//drag node
            this.arrSelected.forEach(node => {
                // if (node.tagName !== 'g') return
                let {x, y} = this.svg.getTranformPos(node as SVGElement);
                node.setAttribute('transform', `translate(${x + dx},${y + dy})`);
            })
        } else {
            this.arrSelected = this.getSelection(e);
        }
        this.link.handlerMouseMove(e);
    };

    private getSelection(e: MouseEvent) {
        this.svg.updateZoom();
        let {x: startX, y: startY} = this.svg.getPosZoom(this.mouseDownPoint.x, this.mouseDownPoint.y);
        let {x: endX, y: endY} = this.svg.getPosZoom(e.clientX, e.clientY);
        return this.selection.updateSelection(Boolean(this.dragTarget), startX, startY, endX, endY);
    }
}