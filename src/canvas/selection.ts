import {INodeProp, TPoint, Svg, Point} from "../svg.js";
import {NodeSelector} from "./canvas.js";

export class Selection {

    private selectionRect: Element | boolean = false;
    private arrSelected: Element[] = [];
    private svgNode: SVGElement;

    constructor(private svg: Svg) {
        this.svgNode = svg.node;
    }

    public startSelection(clientX: number, clientY: number): Point {
        const startPoint = new Point(clientX, clientY);

        if (this.selectionRect) {
            this.svgNode.removeChild(this.selectionRect as Element);
        }

        // @ts-ignore
        this.selectionRect = this.svg.rectangle({
            x: startPoint.x, y: startPoint.y, width: 0, height: 0,
            fill: '#ccccee', fillOpacity: 0.3, stroke: '#222255', strokeDasharray: '4'
        })

        return startPoint;
    };

    public getSelected(dragTarget: Element, sx: number, sy: number, ex: number, ey: number): Element[] {
        if (dragTarget && !dragTarget.classList.contains(NodeSelector.selected)) { // если по не выделенному то
            this.clearSelection(); //сбраываем все выделение
            dragTarget.classList.add(NodeSelector.selected);//и выделяем который под курсором
            return this.arrSelected = [dragTarget];
        }
        if (!this.selectionRect) return this.arrSelected;
        const [x, y, width, height] = [Math.min(sx, ex), Math.min(sy, ey), Math.abs(ex - sx), Math.abs(ey - sy)];

        this.svg.setProperty(this.selectionRect as Element, {x, y, height, width} as INodeProp)

        const rect = (this.selectionRect as SVGGraphicsElement).getBBox();
        const elements: NodeListOf<SVGGraphicsElement> = this.svgNode.querySelectorAll('.' + NodeSelector.node);

        elements.forEach((node: SVGGraphicsElement) => {
            const {height: nh, width: nw} = (node as SVGGraphicsElement).getBBox();
            const {x, y} = this.svg.getTransformPoint(node);

            if (rect.x <= x + nw && rect.x + rect.width >= x && rect.y <= y + nh && rect.y + rect.height >= y) {
                if (!node.classList.contains(NodeSelector.selected)) node.classList.add(NodeSelector.selected);
            } else {
                if (!dragTarget) node.classList.remove(NodeSelector.selected);
            }
        });
        this.arrSelected = Array.from(this.svgNode.querySelectorAll('.selected'));

        return this.arrSelected;
    }

    public clearSelection() {
        this.arrSelected.forEach(el => el.classList.remove(NodeSelector.selected));
        this.arrSelected = [];
    }

    public clearRectSelection() {
        if (!this.selectionRect) return;
        this.svgNode.removeChild(this.selectionRect as Element);
        this.selectionRect = false;
    }

}