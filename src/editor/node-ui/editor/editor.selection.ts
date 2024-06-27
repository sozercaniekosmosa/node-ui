import {INodeProp, TPoint, Svg, Point, TMouseEvent} from "../svg";
import {NodeSelector, NodeUI} from "../node-ui";

export class EditorSelection {

    private selectionRect: Element | boolean = false;
    private readonly svg: SVGElement;
    private clickTarget: Element | null = null;
    private dragTarget: Element | null = null;

    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
    }

    public handlerMouseDown({target, p, start: s}: TMouseEvent): void {

        this.clickTarget = (target as Element);
        const targetDown = this.clickTarget.closest('.' + NodeSelector.node);
        const isHandle = this.clickTarget.classList.contains(NodeSelector.handle);
        const isEmpty = this.clickTarget === this.svg;

        if (targetDown && isHandle) { //select
            this.dragTarget = targetDown;
            this.startSelection(p);
            if (!targetDown.classList.contains(NodeSelector.selected)) {
                this.clearSelection();
                targetDown.classList.add(NodeSelector.selected);
            }
        } else if (isEmpty) {//reset|new selection
            this.startSelection(p);
            this.clearSelection();
        }

    }

    public handlerMouseMove({distance, start: s, p, button}: TMouseEvent): void {
        const isEmpty = this.clickTarget === this.svg;

        if (isEmpty && distance > 3 && !this.nu.isMode('select-rect')) {// selection
            this.nu.setMode('select-rect')
        }

        if (!button[0]) this.nu.resetMode('select-rect');
        if (!this.nu.isMode('select-rect')) return;

        if (isEmpty) {
            this.getSelected(s.x, s.y, p.x, p.y);
        }
    }

    public handlerMouseUp(e: TMouseEvent): void {
        this.clearRectSelection();
        this.dragTarget = null;
    }

    public startSelection(startPoint: Point): Point {
        this.selectionRect && this.svg.removeChild(this.selectionRect as Element);

        this.selectionRect = this.nu.rectangle({
            x: startPoint.x, y: startPoint.y, width: 0, height: 0,
            fill: '#ccccee', fillOpacity: 0.3, stroke: '#222255', strokeDasharray: '4'
        })

        return startPoint;
    };

    public getSelected(sx: number, sy: number, ex: number, ey: number): void {
        if (this.dragTarget && !this.dragTarget.classList.contains(NodeSelector.selected)) { // если по не выделенному то
            this.clearSelection(); //сбраываем все выделение
            this.dragTarget.classList.add(NodeSelector.selected);//и выделяем который под курсором
        }
        if (!this.selectionRect) return;
        const [x, y, width, height] = [Math.min(sx, ex), Math.min(sy, ey), Math.abs(ex - sx), Math.abs(ey - sy)];

        this.nu.setProperty(this.selectionRect as Element, {x, y, height, width} as INodeProp)

        const rect = (this.selectionRect as SVGGraphicsElement).getBBox();
        const elements: NodeListOf<SVGGraphicsElement> = this.svg.querySelectorAll('.' + NodeSelector.node);

        elements.forEach((node: SVGGraphicsElement) => {
            const {height: nh, width: nw} = (node as SVGGraphicsElement).getBBox();
            const {x, y} = this.nu.getTransformPoint(node);

            if (rect.x <= x + nw && rect.x + rect.width >= x && rect.y <= y + nh && rect.y + rect.height >= y) {
                if (!node.classList.contains(NodeSelector.selected)) node.classList.add(NodeSelector.selected);
            } else {
                if (!this.dragTarget) node.classList.remove(NodeSelector.selected);
            }
        });
    }

    public clearSelection() {
        this.svg.querySelectorAll('.' + NodeSelector.selected).forEach(el => el.classList.remove(NodeSelector.selected));
    }

    public clearRectSelection() {
        if (!this.selectionRect) return;
        this.svg.removeChild(this.selectionRect as Element);
        this.selectionRect = false;
    }
}