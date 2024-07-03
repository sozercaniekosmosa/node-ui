import {INodeProp, TPoint, Svg, Point, TMouseEvent} from "../svg";
import {NodeSelector, NodeUI} from "../node-ui";

export class EditorSelection {

    private selectionRect: Element | boolean = false;
    private readonly svg: SVGElement;
    private targetDown: Element | null = null;
    private dragTarget: Element | null = null;
    private arrSelected: Element[] | null = [];
    private isControlLeft: boolean = false;
    private wasSelected: boolean = false;

    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
        document.addEventListener('keydown', (e: EventInit) => this.handlerKeyDown(e));
        document.addEventListener('keyup', (e: EventInit) => this.handlerKeyUp(e));
    }

    private handlerKeyDown(e): void {
        if (e.code == 'ControlLeft') this.isControlLeft = true;
    }

    private handlerKeyUp(e): void {
        if (e.code == 'ControlLeft') this.isControlLeft = false;
    }

    public handlerMouseDown({target, p, start: s}: TMouseEvent): void {

        this.targetDown = (target as Element);
        const isEmpty = this.targetDown === this.svg;
        const targetDown = this.targetDown.closest('.' + NodeSelector.node);
        const isHandle = this.targetDown.classList.contains(NodeSelector.handle);

        if (targetDown && isHandle) { //select
            this.dragTarget = targetDown;
            this.startSelection(p);
            this.wasSelected = targetDown.classList.contains(NodeSelector.selected);
            if (!this.wasSelected) {
                if (!this.isControlLeft) this.clearSelection();
                targetDown.classList.add(NodeSelector.selected);
            }
        } else if (isEmpty) {//reset|new selection
            this.startSelection(p);
            this.clearSelection();
        }

    }

    public handlerMouseMove({distance, start: s, p, button}: TMouseEvent): void {
        const isEmpty = this.targetDown === this.svg;

        if (isEmpty && distance > 3 && !this.nu.isMode('select-rect')) {// selection
            this.nu.setMode('select-rect')
        }

        if (!button[0]) this.nu.resetMode('select-rect');
        if (!this.nu.isMode('select-rect')) return;

        if (isEmpty) {
            this.getSelected(s.x, s.y, p.x, p.y);
        }
    }

    public handlerMouseUp({target, distance}: TMouseEvent): void {
        this.clearRectSelection();
        this.dragTarget = null;

        let targetUp = (target as Element);

        if (this.targetDown == targetUp && distance <= 3) {
            let targetDown = this.targetDown.closest('.' + NodeSelector.node);
            if (this.isControlLeft && targetDown?.classList.contains(NodeSelector.selected) && this.wasSelected) {
                targetDown.classList.remove(NodeSelector.selected);
            }
        }

        let listSelected = this.svg.querySelectorAll('.' + NodeSelector.selected);
        if (listSelected) this.arrSelected = [...listSelected]
        this.svg.dispatchEvent(new CustomEvent('selected', {detail: listSelected ? this.arrSelected : null}));
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
        // if (this.dragTarget && !this.dragTarget.classList.contains(NodeSelector.selected)) { // если по не выделенному то
        //     this.clearSelection(); //сбраываем все выделение
        //     this.dragTarget.classList.add(NodeSelector.selected);//и выделяем который под курсором
        // }
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