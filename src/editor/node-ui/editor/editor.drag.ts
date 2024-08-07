import {Svg, TMouseEvent} from "../svg";
import {NodeSelector, NodeUI} from "../node-ui";

export class EditorDrag {
    private readonly svg: SVGElement;
    private dragTarget: SVGElement | Element | null = null;
    private arrSelected: SVGElement[] | null = null;
    private clickTarget: SVGElement | Element | null = null;
    private isDragged: boolean = false;


    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
    }

    public handlerMouseDown({target}: TMouseEvent): void {

        this.clickTarget = (target as Element);
        const isHandle = this.clickTarget.classList.contains(NodeSelector.handle);
        const targetDown = this.clickTarget.closest('.' + NodeSelector.node);

        if (targetDown && isHandle) { //select
            this.nu.setMode('drag')
            this.dragTarget = targetDown;
        }
        this.arrSelected = Array.from(this.svg.querySelectorAll('.selected'));
    }

    public handlerMouseMove({delta: d, button, distance}: TMouseEvent): void {
        if (!button[0]) this.nu.resetMode('drag');
        if (!this.nu.isMode('drag')) return;

        if (this.dragTarget) {//drag node
            if (distance > 3) this.isDragged = true;
            this.arrSelected?.forEach(node => {
                var p = this.nu.getTransformPoint(node);
                this.nu.setTransformPoint(node, p.add(d))
            })
        }
    }

    public handlerMouseUp(e: TMouseEvent): void {
        this.dragTarget = null;
        if (this.isDragged) {
            this.svg.dispatchEvent(new CustomEvent('dragged', {detail: {}}));
            this.isDragged = false;
        }
    }

}