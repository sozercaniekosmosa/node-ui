export type TPoint = {
    x: number;
    y: number;
}

export type TMouseEvent = {
    target: EventTarget,
    _p: Point,
    p: Point,
    delta: Point,
    start: Point,
    end: Point,
    targetDownCentre: Point,
    targetUpCentre: Point,
    zoomDirection: number,
}

export class Point {
    x: number = 0;
    y: number = 0;

    constructor();
    constructor(px: number, py: number);
    // constructor(p: Point | { x: number, y: number });
    constructor(p: { x: number, y: number });
    constructor(...args: any[]) {
        if (args.length == 0) {
        } else if (typeof args[0] === 'number') {
            [this.x, this.y] = args;
        } else {
            this.x = args[0].x;
            this.y = args[0].y;
        }
    }

    set(p: Point | { x: number, y: number }): Point ;
    set(val: number): Point;
    set(x: number, y: number): Point;
    set(...args: any[]): Point {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            this.x = args[0];
            this.y = args[1];
            return this;
        } else if (typeof args[0] === 'number' && args.length == 1) {
            this.x = args[0];
            this.y = args[0];
            return this;
        } else {
            this.x = args[0].x;
            this.y = args[0].y;
            return this;
        }
    }

    add(p: Point): Point ;
    add(val: number): Point;
    add(x: number, y: number): Point;
    add(...args: any[]): Point {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            this.x += args[0];
            this.y += args[1];
            return this;
        } else if (typeof args[0] === 'number' && args.length == 1) {
            this.x += args[0];
            this.y += args[0];
            return this;
        } else {
            this.x += args[0].x;
            this.y += args[0].y;
            return this;
        }
    }

    sub(p: Point): Point ;
    sub(val: number): Point;
    sub(x: number, y: number): Point;
    sub(...args: any[]): Point {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            this.x -= args[0];
            this.y -= args[1];
            return this;
        } else if (typeof args[0] === 'number' && args.length == 1) {
            this.x -= args[0];
            this.y -= args[0];
            return this;
        } else {
            this.x -= args[0].x;
            this.y -= args[0].y;
            return this;
        }
    }

    mul(p: Point): Point ;
    mul(val: number): Point;
    mul(x: number, y: number): Point;
    mul(...args: any[]): Point {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            this.x *= args[0];
            this.y *= args[1];
            return this;
        } else if (typeof args[0] === 'number' && args.length == 1) {
            this.x *= args[0];
            this.y *= args[0];
            return this;
        } else {
            this.x *= args[0].x;
            this.y *= args[0].y;
            return this;
        }
    }

    div(p: Point): Point ;
    div(val: number): Point;
    div(x: number, y: number): Point;
    div(...args: any[]): Point {
        if (typeof args[0] === 'number' && typeof args[1] === 'number') {
            this.x /= args[0];
            this.y /= args[1];
            return this;
        } else if (typeof args[0] === 'number' && args.length == 1) {
            this.x /= args[0];
            this.y /= args[0];
            return this;
        } else {
            this.x /= args[0].x;
            this.y /= args[0].y;
            return this;
        }
    }

    neg(): Point {
        this.x *= -1;
        this.y *= -1;
        return this;
    }

    clone(): Point {
        return new Point(this);
    }

    point(): Point {
        return {x: this.x, y: this.y} as Point;
    }
}

export interface INodeProp {
    x?: number,
    y?: number,
    x1?: number,
    y1?: number,
    x2?: number,
    y2?: number,
    cx?: number,
    cy?: number,
    r?: number,
    width?: number,
    height?: number
    rx?: number,
    fill?: string,
    fillOpacity?: number,
    stroke?: string,
    strokeDasharray?: string,
    strokeWidth?: number,
    d?: string,
    transform?: string,
    to?: Element,
    class?: string[] | string,
    data?: object,
    id?: string,
    strokeLinecap?: string,
    shapeRendering?: string,
}

export class Svg {

    private viewBox: { x: number; width: number; y: number; height: number };
    private kZoom: Point;
    public node: SVGElement;
    private off: Point;
    public width: number;
    public height: number;

    private readonly mouse: TMouseEvent;
    private startPoint: Point;

    constructor(dest: HTMLElement = document.body) {
        this.node = this.createSvg({
            width: dest.clientWidth, height: dest.clientHeight, to: dest,
            // shapeRendering: "crispEdges"
        })
        this.width = dest.clientWidth;
        this.height = dest.clientHeight;

        this.mouse = {
            _p: new Point(), p: new Point(), start: new Point(), end: new Point(), delta: new Point(),
        } as TMouseEvent;

        this.node.addEventListener('wheel', e => this.handlerMouseWheel(e));
        this.node.addEventListener('mousedown', e => this.handlerMouseDown(e));
        this.node.addEventListener('mouseup', e => this.handlerMouseUp(e));
        this.node.addEventListener('mousemove', e => this.handlerMouseMove(e));
    }

    /**
     * Получить позицию и размеры node
     * @param node
     */
    public getBox(node) {
        const {x, y, width, height} = node.getBoundingClientRect();
        return {x: x - this.off.x, y: y - this.off.y, width, height};
    }

    private updateZoom() {
        const [x, y, width, height] = this.node.getAttribute('viewBox').split(' ').map(it => +it);
        this.viewBox = {x, y, width, height}
        this.kZoom = new Point(+width / this.width, +height / this.height);
    }

    /**
     * Для пересчета p:Point позиции с учетом zoom
     * @param p
     */
    getPosZoom(p: Point) {
        const vp = new Point(this.viewBox);
        const kz = this.kZoom;
        return new Point(p).mul(kz).add(vp)
    }

    getView() {
        const [x, y, width, height] = this.node.getAttribute('viewBox').split(' ').map(it => +it);
        return {x, y, width, height};
    }

    setView(x, y, width, height) {
        this.node.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    }

    camelToKebab(camelCaseString: string): string {
        return camelCaseString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    getTransformPoint(node: SVGElement) {
        let transformValue = node.getAttribute('transform');
        let translateValues = transformValue!.match(/translate\(([^)]+)\)/);
        const [x, y] = translateValues ? translateValues[1].split(',').map(Number) : [0, 0];
        return {x, y};
    }

    setProperty(node: Element, arg: INodeProp) {
        Object.entries(arg).forEach(([key, val]) => {
            if (key == 'to') {
                (val as SVGElement).append(node);
            } else if (key == 'data') {
                Object.entries(val).forEach(([k, v]) => (node as HTMLElement).dataset[k] = String(v));
            } else if (key == 'id') {
                node.id = val;
            } else if (key == 'class') {
                node.classList.value = (typeof val === 'string') ? val : val.join(' ');
            } else {
                node.setAttribute(this.camelToKebab(key), val)
            }
        });
    }

    private createElement(nameNode: string, prop: INodeProp) {
        if (!prop?.to) prop.to = this.node;
        const node = document.createElementNS('http://www.w3.org/2000/svg', nameNode);
        this.setProperty(node, prop);
        return node;
    }

    private createSvg = (prop: INodeProp): SVGElement => this.createElement('svg', prop);
    private createText = (prop: INodeProp): SVGElement => this.createElement('svg', prop);
    public circle = (prop: INodeProp): SVGElement | SVGGraphicsElement => this.createElement('circle', prop);
    public rectangle = (prop: INodeProp): SVGElement | SVGGraphicsElement => this.createElement('rect', prop);

    public group(prop: INodeProp): SVGElement {
        prop.transform = (!prop?.x || !prop?.y) ? `translate(${0},${0})` : `translate(${prop.x},${prop.y})`;
        return this.createElement('g', prop);
    }

    public updateLink(nodeSpline: SVGElement, sp: Point, ep: Point, prop?: INodeProp): void;
    public updateLink(nodeSpline: SVGElement, sx: number, sy: number, ex: number, ey: number, prop?: INodeProp): void;

    public updateLink(...args: any[]): void {
        let nodeSpline, sx, sy, ex, ey, prop, sp, ep;
        if (typeof args[1] === 'number') {
            [nodeSpline, sx, sy, ex, ey, prop] = args;
        } else {
            [nodeSpline, sp, ep, prop] = args;
            [sx, sy] = [sp.x, sp.y];
            [ex, ey] = [ep.x, ep.y];
        }

        const path = this.pathCalc(sx, ex, sy, ey);
        this.setProperty(nodeSpline, {...prop, d: path});
    }

    // newLine.setAttribute('id','line2');
    // newLine.setAttribute('x1','0');
    // newLine.setAttribute('y1','0');
    // newLine.setAttribute('x2','200');
    // newLine.setAttribute('y2','200');

    public line(sx: number, sy: number, ex: number, ey: number, prop?: INodeProp): SVGElement {
        return this.createElement('line', {...prop, x1: sx, y1: sy, x2: ex, y2: ey});
    }

    public link(sx: number, sy: number, ex: number, ey: number, prop?: INodeProp): SVGElement {
        const path = this.pathCalc(sx, ex, sy, ey);
        return this.createElement('path', {...prop, d: path});
    }

    private pathCalc(sx, ex, sy, ey) {
        const controlPoint1 = {x: sx + (ex - sx) / 3, y: sy};
        const controlPoint2 = {x: ex - (ex - sx) / 3, y: ey};
        return `M${sx} ${sy} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${ex} ${ey}`;
    }

    private handlerMouseWheel(e: WheelEvent) {
        const zoomFactor = 1.3;
        const {offsetX, offsetY, deltaY} = e;

        const zoomDirection = deltaY < 0 ? 1 / zoomFactor : zoomFactor;
        const off = new Point(offsetX, offsetY);
        const {x, y, width, height} = this.getView()
        const size = new Point(width, height)
        const winSize = new Point(this.width, this.height);

        const newSize = size.clone().mul(zoomDirection)
        const _off = off.clone().div(winSize).mul(size).add(x, y)
        off.div(winSize).mul(newSize).neg().add(_off)
        this.setView(off.x, off.y, newSize.x, newSize.y);

        this.mouse.zoomDirection = zoomDirection;

        if (this?.startPoint) this.mouse.start = this.getPosZoom(this.startPoint); //zoom изменился => обновляем позицию

        this.node.dispatchEvent(new CustomEvent('svgwheel', {detail: {...this.mouse}}))
    }

    private handlerMouseDown(e: MouseEvent) {
        this.updateZoom();

        this.mouse.target = e.target;
        this.startPoint = new Point(e.offsetX, e.offsetY); //сохраняем позицию что бы обновить её если изменится zoom
        this.mouse.start = this.getPosZoom(this.startPoint);

        //считаем центр target
        const {x, y, width, height} = this.getBox(e.target);
        const pCentre = new Point(width, height).mul(.5).add(x, y);
        this.mouse.targetDownCentre = this.getPosZoom(pCentre);

        this.node.dispatchEvent(new CustomEvent('svgmousedown', {detail: {...this.mouse}}))
    }

    private handlerMouseUp(e: MouseEvent) {
        this.updateZoom();
        this.mouse.target = e.target;
        this.mouse.end = this.getPosZoom(new Point(e.offsetX, e.offsetY));

        //считаем центр target
        const {x, y, width, height} = this.getBox(e.target);
        const pCentre = new Point(width, height).mul(.5).add(x, y);
        this.mouse.targetUpCentre = this.getPosZoom(pCentre);

        this.node.dispatchEvent(new CustomEvent('svgmouseup', {detail: {...this.mouse}}))
    }

    private handlerMouseMove(e: MouseEvent) {
        this.updateZoom();
        this.mouse.target = e.target;

        this.off = new Point(e.clientX - e.offsetX, e.clientY - e.offsetY);

        this.mouse.p = new Point(e.offsetX, e.offsetY)
        if (!this.mouse._p) this.mouse._p = this.mouse.p.clone();
        this.mouse.delta = this.mouse.p.clone().add(this.mouse._p.neg());
        this.mouse._p = this.mouse.p.clone();
        this.mouse.p = this.getPosZoom(this.mouse.p);

        this.node.dispatchEvent(new CustomEvent('svgmousemove', {detail: {...this.mouse}}))

    }
}
