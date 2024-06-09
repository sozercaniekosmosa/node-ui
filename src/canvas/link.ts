import {base64to, toBase64} from "../utils.js";
import {ObjectState} from "./canvas.js";
import {IPoint, Svg, Point} from "../svg.js";

export class Link {


    public nodeConnectorStart: SVGElement | null = null;
    private startPos: IPoint | null = null;
    private nodeLink: SVGElement | null = null;

    private nodeUnitDrag: SVGElement | null = null;
    private svgNode: SVGElement;

    constructor(private svg: Svg) {
        this.svgNode = svg.node;
    }

    public removeConnection(nodeLink: SVGElement) {
        if (nodeLink?.id) {
            const [startConnId, endConnId] = nodeLink.id.split('-')
            const [nodeSrcConn, nodeDestConn] = this.svgNode.querySelectorAll(`#${startConnId},#${endConnId}`) as NodeListOf<HTMLElement>;
            let setStart = new Set(JSON.parse(nodeSrcConn.dataset.to))
            setStart.delete(endConnId);
            nodeSrcConn.dataset.to = JSON.stringify([...setStart]);

            let setEnd = new Set(JSON.parse(nodeDestConn.dataset.to))
            setEnd.delete(startConnId);
            nodeDestConn.dataset.to = JSON.stringify([...setEnd]);
        }
        nodeLink && this.svgNode.removeChild(nodeLink as Element);
    }

    public updateConnection(node: SVGElement) {

        this.svg.updateZoom();

        const arrInNodeDestConn = node.parentElement.querySelectorAll(`.${ObjectState.pinIn}`) as NodeListOf<HTMLElement>;
        const arrOutNodeDestConn = node.parentElement.querySelectorAll(`.${ObjectState.pinOut}`) as NodeListOf<HTMLElement>;

        [...arrInNodeDestConn, ...arrOutNodeDestConn].forEach(({id, dataset}) => {
            if (dataset.to) {
                const arrTo = new Set(JSON.parse(dataset.to));
                arrTo.forEach(idTo => {
                    const [nodeSrcConn, nodeDestConn] = this.svgNode.querySelectorAll(`#${id},#${idTo}`);
                    const nodeLink = this.svgNode.querySelector(`#${id}-${idTo},#${idTo}-${id}`);

                    let {x: sx, y: sy, width: sw, height: sh} = nodeSrcConn.getBoundingClientRect();
                    const s = this.svg.getPosZoom(sx + sw * .5, sy + sh * .5);
                    let {x: ex, y: ey, width: ew, height: eh} = nodeDestConn.getBoundingClientRect();
                    const e = this.svg.getPosZoom(ex + ew * .5, ey + eh * .5);
                    this.svg.updateLink(nodeLink as SVGElement, s.x, s.y, e.x, e.y, {})
                })
            }
        })
    }

    public handlerMouseDown(e: MouseEvent): any {
        const clickTarget = e.target as SVGElement;
        this.nodeUnitDrag = clickTarget.parentElement?.querySelector('.' + ObjectState.handle) as SVGElement;
        if (clickTarget.classList.contains(ObjectState.pinIn) || clickTarget.classList.contains(ObjectState.pinOut)) {
            e.preventDefault();
            this.nodeConnectorStart = clickTarget; //запоминаем коннектор
            const {x, y, width, height} = clickTarget.getBoundingClientRect();
            this.startPos = new Point(width, height).mul(.5).add(x, y);

            this.svg.updateZoom();
            const {x: ox, y: oy} = this.svg.getPosZoom(e.clientX, e.clientY)
            this.nodeLink = this.svg.link(ox, oy, ox, oy, {
                class: ObjectState.link,
                strokeLinecap: 'round',
            })
        }
    }

    public handlerMouseMove(e: MouseEvent): any {
        if (this.nodeConnectorStart) {
            this.svg.updateZoom();

            var {x, y} = this.startPos as IPoint;
            var {x: ax, y: ay} = this.svg.getPosZoom(x, y);
            var {x: bx, y: by} = this.svg.getPosZoom(e.clientX, e.clientY);

            this.svg.updateLink(this.nodeLink as SVGElement, ax, ay, bx, by, {})
        } else if (this.nodeUnitDrag) {
            this.updateConnection(this.nodeUnitDrag)
        }
    }

    public handlerMouseUp(e: MouseEvent): any {

        if (!this.nodeConnectorStart) return;

        const clickTarget = e.target as SVGElement;

        const isEndOut = clickTarget.classList.contains(ObjectState.pinOut);
        const isEndIn = clickTarget.classList.contains(ObjectState.pinIn);
        const isStartIn = this.nodeConnectorStart.classList.contains(ObjectState.pinIn);
        const isStartOut = this.nodeConnectorStart.classList.contains(ObjectState.pinOut);

        if ((isStartIn && isEndOut) || (isStartOut && isEndIn)) { // подключение к пину
            e.preventDefault();

            this.svg.updateZoom();
            const nodeConnectorEnd = clickTarget;
            const {x, y, width, height} = clickTarget.getBoundingClientRect();
            const {x: sx, y: sy} = this.svg.getPosZoom(this.startPos.x, this.startPos.y)
            const {x: ex, y: ey} = this.svg.getPosZoom(x + width * .5, y + height * .5)
            this.svg.updateLink(this.nodeLink as SVGElement, sx, sy, ex, ey, {})

            const setEndTo = new Set(nodeConnectorEnd.dataset?.to ? JSON.parse(nodeConnectorEnd?.dataset.to) : []);
            setEndTo.add(this.nodeConnectorStart.id)
            nodeConnectorEnd.dataset.to = JSON.stringify([...setEndTo]);

            const setStartTo = new Set(this.nodeConnectorStart.dataset?.to ? JSON.parse(this.nodeConnectorStart?.dataset.to) : []);
            setStartTo.add(nodeConnectorEnd.id)
            this.nodeConnectorStart.dataset.to = JSON.stringify([...setStartTo]);

            this.nodeLink.id = clickTarget.classList.contains(ObjectState.pinIn) ? this.nodeConnectorStart.id + '-' + nodeConnectorEnd.id : nodeConnectorEnd.id + '-' + this.nodeConnectorStart.id;

        } else {
            this.removeConnection(this.nodeLink)
        }
        this.nodeLink = null;
        this.nodeConnectorStart = null;
        this.nodeUnitDrag = null;
    }
}