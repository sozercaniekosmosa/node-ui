import {Point, Svg, TMouseEvent} from "../svg";
import {NodeSelector, NodeUI} from "../node-ui";
import {b} from "vite/dist/node/types.d-aGj9QkWt";

export class EditorLinkRemove {

    public nodeStart: SVGElement | null = null;
    private nodeRemove: SVGElement | null = null;
    private readonly svg: SVGElement;
    private readonly gpath: SVGElement;

    constructor(private nu: NodeUI) {
        this.svg = nu.svg;
        this.gpath = nu.gpath;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
    }

    public removeNode(node: SVGElement) {
        if (node?.id) {
            const [startConnId, endConnId] = node.id.split('-');
            const nodeSrcConn = this.svg.querySelector('#' + startConnId) as HTMLElement;
            const nodeDestConn = this.svg.querySelector('#' + endConnId) as HTMLElement;
            let setStart = new Set(nodeSrcConn.dataset.to?.split(' '));
            setStart.delete(endConnId);
            nodeSrcConn.dataset.to = [...setStart].join(' ');

            let setEnd = new Set(nodeDestConn.dataset.to?.split(' '));
            setEnd.delete(startConnId);
            nodeDestConn.dataset.to = [...setEnd].join(' ');
        }
        node && this.gpath.removeChild(node as Element);
        // node && this.svg.removeChild(node as Element);
    }

    public handlerMouseDown({p, target}: TMouseEvent): void {
        if (this.nu.key['altleft']) this.nu.setMode('link-remove');
        if (!this.nu.isMode('link-remove')) return;

        if (target == this.svg) {
            this.nodeRemove = this.nu.line(p.x, p.y, p.x, p.y, {class: NodeSelector.linkRemove})
        }
    }

    public handlerMouseMove({p, start: s}: TMouseEvent): void {
        if (!this.nu.key['altleft']) this.nu.resetMode('link-remove');
        if (!this.nu.isMode('link-remove')) return;

        if (this.nodeRemove) {
            this.nu.setProperty(this.nodeRemove, {x1: s.x, y1: s.y, x2: p.x, y2: p.y, class: NodeSelector.linkRemove})
        }
    }

    public handlerMouseUp({start, end}: TMouseEvent): void {

        if (this.nodeRemove) {

            // получаем все link
            const arrLink = [...this.svg.querySelectorAll('.' + NodeSelector.link)];

            const lineRemove = [start, end]; //задаем позиции для секущей линии

            //задаем позиции для каждой link
            const arrLine = arrLink.map((node: any) => [node.getPointAtLength(0), node.getPointAtLength(node.getTotalLength()), node]);

            let didRemove = false;
            //перебираем все links ищем пересечение с линией удаления
            arrLine.forEach(line => {
                if (this.isIntersectLines(line, lineRemove)) {
                    this.removeNode(line[2]);
                    didRemove = true;
                }
            });
            // this.removeNode(this.nodeRemove)
            this.svg.removeChild(this.nodeRemove);
            this.nodeRemove = null;
            if(didRemove) this.svg.dispatchEvent(new CustomEvent('link-remove', {detail: {}}));
        }
    }

    private isIntersectLines(p1: any, p2: any): boolean {
        const {x: x1, y: y1} = p1[0];
        const {x: x2, y: y2} = p1[1];
        const {x: x3, y: y3} = p2[0];
        const {x: x4, y: y4} = p2[1];

        const orient1 = (x3 - x1) * (y2 - y1) - (x2 - x1) * (y3 - y1);
        const orient2 = (x4 - x1) * (y2 - y1) - (x2 - x1) * (y4 - y1);
        const orient3 = (x1 - x3) * (y4 - y3) - (x4 - x3) * (y1 - y3);
        const orient4 = (x2 - x3) * (y4 - y3) - (x4 - x3) * (y2 - y3);

        return (orient1 * orient2 < 0) && (orient3 * orient4 < 0);
    }

    // private handlerDblClick(e: MouseEvent) {
    //     this.removeNode(e.target as SVGElement)
    // }
}