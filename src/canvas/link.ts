import {base64to, toBase64} from "../utils.js";
import {NodeSelector} from "./canvas.js";
import {TPoint, Svg, Point, TMouseEvent} from "../svg.js";

export class Link {


    public nodeStart: SVGElement | null = null;
    private startPos: TPoint | null = null;
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

        const arrInNodeDestConn = node.parentElement.querySelectorAll(`.${NodeSelector.pinIn}`) as NodeListOf<HTMLElement>;
        const arrOutNodeDestConn = node.parentElement.querySelectorAll(`.${NodeSelector.pinOut}`) as NodeListOf<HTMLElement>;

        [...arrInNodeDestConn, ...arrOutNodeDestConn].forEach(({id, dataset}) => {
            if (dataset.to) {
                // const arrTo = new Set(JSON.parse(dataset.to));
                const arrTo = new Set(dataset.to.split(' '));
                arrTo.forEach(idTo => {
                    const [nodeSrcConn, nodeDestConn] = this.svgNode.querySelectorAll(`#${id},#${idTo}`);
                    const nodeLink = this.svgNode.querySelector(`#${id}-${idTo},#${idTo}-${id}`);

                    let {x: sx, y: sy, width: sw, height: sh} = nodeSrcConn.getBoundingClientRect();
                    let {x: ex, y: ey, width: ew, height: eh} = nodeDestConn.getBoundingClientRect();
                    const s = this.svg.getPosZoom(new Point(sw, sh).mul(.5).add(sx, sy));
                    const e = this.svg.getPosZoom(new Point(ew, eh).mul(.5).add(ex, ey));
                    this.svg.updateLink(nodeLink as SVGElement, s, e)
                })
            }
        })
    }

    public handlerMouseDown({p, target, targetDownCentre: c}: TMouseEvent): any {
        const clickTarget = target as SVGElement;
        this.nodeUnitDrag = clickTarget.parentElement?.querySelector('.' + NodeSelector.handle) as SVGElement;
        if (clickTarget.classList.contains(NodeSelector.pinIn) || clickTarget.classList.contains(NodeSelector.pinOut)) {
            this.nodeStart = clickTarget; //запоминаем коннектор
            this.nodeLink = this.svg.link(c.x, c.y, c.x, c.y, {class: NodeSelector.link, strokeLinecap: 'round',})
        }
    }

    public handlerMouseMove({p, start: s, targetDownCentre: c}: TMouseEvent): any {
        if (this.nodeStart) {
            this.svg.updateLink(this.nodeLink as SVGElement, c, p)
        } else if (this.nodeUnitDrag) {
            this.updateConnection(this.nodeUnitDrag)
        }
    }

    public handlerMouseUp({target, targetDownCentre: sc, targetUpCentre: ec}: TMouseEvent): any {

        if (!this.nodeStart) return;

        const clickTarget = target as SVGElement;

        const isEndOut = clickTarget.classList.contains(NodeSelector.pinOut);
        const isEndIn = clickTarget.classList.contains(NodeSelector.pinIn);
        const isStartIn = this.nodeStart.classList.contains(NodeSelector.pinIn);
        const isStartOut = this.nodeStart.classList.contains(NodeSelector.pinOut);

        if ((isStartIn && isEndOut) || (isStartOut && isEndIn)) { // подключение к пину

            const nodeEnd = clickTarget;
            this.svg.updateLink(this.nodeLink as SVGElement, sc, ec)

            const setEndTo = new Set(nodeEnd.dataset?.to ? nodeEnd?.dataset.to.split(' ') : []);
            setEndTo.add(this.nodeStart.id)
            nodeEnd.dataset.to = [...setEndTo].join(' ');

            const setStartTo = new Set(this.nodeStart.dataset?.to ? this.nodeStart?.dataset.to.split(' ') : []);
            setStartTo.add(nodeEnd.id)
            this.nodeStart.dataset.to = [...setStartTo].join(' ');

            this.nodeLink.id = clickTarget.classList.contains(NodeSelector.pinIn) ? this.nodeStart.id + '-' + nodeEnd.id : nodeEnd.id + '-' + this.nodeStart.id;

        } else {
            this.removeConnection(this.nodeLink)
        }
        this.nodeLink = null;
        this.nodeStart = null;
        this.nodeUnitDrag = null;
    }
}