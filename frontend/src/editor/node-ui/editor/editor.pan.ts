import {Svg, TMouseEvent} from "../svg";
import {NodeUI} from "../node-ui";

export class EditorPan {
    private readonly svg: SVGElement;
    private dragTarget: SVGElement | Element | null = null;
    private arrKey = [];


    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

        this.svg.addEventListener('svgmousedown', (e: CustomEventInit) => this.handlerMouseDown(e.detail));
        this.svg.addEventListener('svgmouseup', (e: CustomEventInit) => this.handlerMouseUp(e.detail));
        this.svg.addEventListener('svgmousemove', (e: CustomEventInit) => this.handlerMouseMove(e.detail));
        document.addEventListener('keydown', (e: KeyboardEvent) => this.handlerKeyDown(e));
        document.addEventListener('keyup', (e: KeyboardEvent) => this.handlerKeyUp(e));
    }

    public handlerMouseDown({button}: TMouseEvent): void {
        if (button[1]) this.nu.setMode('pan')
        if (this.arrKey['space']) this.nu.setMode('pan')
        if (!this.nu.isMode('pan')) return;

    }

    public handlerMouseMove({delta: d, button}: TMouseEvent): void {
        if (!button[1] && !button[0]) this.nu.resetMode('pan');
        if (!this.nu.isMode('pan')) return;

        let {x, y, width, height} = this.nu.getView();
        this.nu.setView(x - d.x, y - d.y, width, height)
    }

    public handlerMouseUp(e: TMouseEvent): void {
        this.dragTarget = null;
    }

    private handlerKeyDown(e: KeyboardEvent) {
        this.arrKey[e.code.toLowerCase()] = true;
    }

    private handlerKeyUp(e: KeyboardEvent) {
        this.arrKey[e.code.toLowerCase()] = false;
    }
}