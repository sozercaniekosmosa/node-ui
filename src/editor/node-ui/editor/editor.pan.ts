import {Svg, TMouseEvent} from "../svg";
import {NodeUI} from "../node-ui";

export class EditorPan {
    private readonly svg: SVGElement;
    private dragTarget: SVGElement | Element | null = null;
    private arrSelected: SVGElement[] | null = null;
    private clickTarget: SVGElement | Element | null = null;


    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
    }

    public handlerMouseDown(e: TMouseEvent): void {
        if (this.nu.key['space']) this.nu.setMode('pan')
        if (!this.nu.isMode('pan')) return;

    }

    public handlerMouseMove({delta: d, button}: TMouseEvent): void {
        if (!button[0]) this.nu.resetMode('pan');
        if (!this.nu.isMode('pan')) return;

        let {x, y, width, height} = this.nu.getView();
        this.nu.setView(x - d.x, y - d.y, width, height)
    }

    public handlerMouseUp(e: TMouseEvent): void {
        this.dragTarget = null;
    }

}