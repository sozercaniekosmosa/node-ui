import {NodeSelector} from "./canvas.js";
import {Point, Svg, TMouseEvent} from "../svg.js";

export class Link {


    public nodeStart: SVGElement | null = null;
    private nodeLink: SVGElement | null = null;
    private nodeRemove: SVGElement | null = null;

    private nodeUnitDrag: SVGElement | null = null;
    private readonly svgNode: SVGElement;

    constructor(private svg: Svg) {
        this.svgNode = svg.node;
    }

    public removeNode(node: SVGElement) {
        if (node?.id) {
            const [startConnId, endConnId] = node.id.split('-');
            const [nodeSrcConn, nodeDestConn] = this.svgNode.querySelectorAll(`#${startConnId},#${endConnId}`) as NodeListOf<HTMLElement>;
            let setStart = new Set(nodeSrcConn.dataset.to.split(' '));
            setStart.delete(endConnId);
            nodeSrcConn.dataset.to = [...setStart].join(' ');

            let setEnd = new Set(nodeDestConn.dataset.to.split(' '));
            setEnd.delete(startConnId);
            nodeDestConn.dataset.to = [...setEnd].join(' ');
        }
        node && this.svgNode.removeChild(node as Element);
    }

    public updateConnection(node: SVGElement) {

        // получаем все конекторы на выделенных nod-ах
        let selector = `.${NodeSelector.selected}>.${NodeSelector.pinIn},.${NodeSelector.selected}>.${NodeSelector.pinOut}`;
        const arrConnector = this.svgNode.querySelectorAll(selector) as NodeListOf<HTMLElement>

        arrConnector.forEach(({id, dataset}) => {
            if (dataset.to) {
                const arrTo = new Set(dataset.to.split(' '));
                arrTo.forEach(idTo => {
                    const [nodeSrcConn, nodeDestConn] = this.svgNode.querySelectorAll(`#${id},#${idTo}`);
                    const nodeLink = this.svgNode.querySelector(`#${id}-${idTo},#${idTo}-${id}`);

                    let {x: sx, y: sy, width: sw, height: sh} = this.svg.getBox(nodeSrcConn);
                    let {x: ex, y: ey, width: ew, height: eh} = this.svg.getBox(nodeDestConn);
                    const start = this.svg.getPosZoom(new Point(sw, sh).mul(.5).add(sx, sy));
                    const end = this.svg.getPosZoom(new Point(ew, eh).mul(.5).add(ex, ey));
                    this.svg.updateLink(nodeLink as SVGElement, start, end)
                })
            }
        })
    }

    public handlerMouseDownLink({target, targetDownCentre: c}: TMouseEvent): any {
        const clickTarget = target as SVGElement;
        this.nodeUnitDrag = clickTarget.parentElement?.querySelector('.' + NodeSelector.handle) as SVGElement;
        if (clickTarget.classList.contains(NodeSelector.pinIn) || clickTarget.classList.contains(NodeSelector.pinOut)) {
            this.nodeStart = clickTarget; //запоминаем коннектор
            this.nodeLink = this.svg.link(c.x, c.y, c.x, c.y, {class: NodeSelector.link, strokeLinecap: 'round',})
        }
    }

    public handlerMouseMoveLink({p, targetDownCentre: c}: TMouseEvent): any {
        if (this.nodeStart) {
            this.svg.updateLink(this.nodeLink as SVGElement, c, p)
        } else if (this.nodeUnitDrag) {
            this.updateConnection(this.nodeUnitDrag)
        }
    }

    public handlerMouseUpLink({target, targetDownCentre: sc, targetUpCentre: ec}: TMouseEvent): any {

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
            this.removeNode(this.nodeLink)
        }
        this.nodeLink = null;
        this.nodeStart = null;
        this.nodeUnitDrag = null;
    }

    public handlerMouseDownRemove({p, target}: TMouseEvent): any {
        if (target == this.svgNode) {
            this.nodeRemove = this.svg.line(p.x, p.y, p.x, p.y, {class: NodeSelector.linkRemove})
        }
    }

    public handlerMouseMoveRemove({p, start: s}: TMouseEvent): any {
        if (this.nodeRemove) {
            this.svg.setProperty(this.nodeRemove, {x1: s.x, y1: s.y, x2: p.x, y2: p.y, class: NodeSelector.linkRemove})
        }
    }

    doLinesIntersect(p1, p2) {
        const {x: x1, y: y1} = p1[0];
        const {x: x2, y: y2} = p1[1];
        const {x: x3, y: y3} = p2[0];
        const {x: x4, y: y4} = p2[1];

        const orientation1 = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
        const orientation2 = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
        const orientation3 = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
        const orientation4 = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);

        return (orientation1 * orientation2 < 0) && (orientation3 * orientation4 < 0);
    }

    public handlerMouseUpRemove({start, end}: TMouseEvent): any {

        if (this.nodeRemove) {

            // получаем все link
            const arrLink = [...this.svgNode.querySelectorAll('.' + NodeSelector.link)];

            const lineRemove = [start, end]; //задаем позиции для секущей линии

            //задаем позиции для каждой link
            const arrLine = arrLink.map((node: any) => [node.getPointAtLength(0), node.getPointAtLength(node.getTotalLength()), node]);

            //перебираем все links ищем пересечение с линией удаления
            arrLine.forEach(line => this.doLinesIntersect(line, lineRemove) && this.removeNode(line[2]));
            this.removeNode(this.nodeRemove)
            this.nodeRemove = null;
        }
    }
}