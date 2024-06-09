export interface IPoint {
    x: number;
    y: number;
}

export class Point implements IPoint {
    x: number = 0;
    y: number = 0;

    constructor(px: number, py: number);
    constructor(p: Point | { x: number, y: number });
    constructor(p: { x: number, y: number });
    constructor(...args: any[]) {
        if (typeof args[0] === 'number') {
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
    private zk: { kx: number; ky: number };
    public node: SVGElement;
    public width: number;
    public height: number;

    constructor(dest: HTMLElement = document.body) {
        this.node = this.createSvg({width: dest.clientWidth, height: dest.clientHeight, to: dest,
            // shapeRendering: "crispEdges"
        })
        this.width = dest.clientWidth;
        this.height = dest.clientHeight;
    }


    updateZoom() {
        const [x, y, width, height] = this.node.getAttribute('viewBox').split(' ').map(it => +it);
        this.viewBox = {x, y, width, height}
        let [kx, ky] = [+width / this.width, +height / this.height];
        this.zk = {kx, ky};
    }

    getPoint(p: IPoint): IPoint {
        const {x: vx, y: vy} = this.viewBox;
        const {ky, kx} = this.zk;
        return {x: p.x * kx + vx, y: p.y * ky + vy}
    }

    getPosZoom(x: number, y: number) {
        const {x: vx, y: vy} = this.viewBox;
        const {ky, kx} = this.zk;
        return {x: x * kx + vx, y: y * ky + vy}
    }

    getView() {
        const [x, y, width, height] = this.node.getAttribute('viewBox').split(' ').map(it => +it);
        return {x, y, width, height};
    }

    setView(x, y, width, height) {
        this.node.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    }

    getZoomK() {
        const [x, y, width, height] = this.node.getAttribute('viewBox').split(' ');
        let [kx, ky] = [+width / this.width, +height / this.height];
        return {kx, ky};
    }

    camelToKebab(camelCaseString: string): string {
        return camelCaseString.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
    }

    getTranformPos(node: SVGElement) {
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
        const node = this.createElement('g', prop);
        return node;
    }

    public updateLink(nodeSpline: SVGElement, sp: IPoint, ep: IPoint, prop: INodeProp): void;
    public updateLink(nodeSpline: SVGElement, sx: number, sy: number, ex: number, ey: number, prop: INodeProp): void;

    public updateLink(...args: any[]): void {
        let nodeSpline, sx, sy, ex, ey, prop, sp, ep;
        if (typeof args[1] === 'number') {
            [nodeSpline, sx, sy, ex, ey, prop] = args;
        } else {
            [nodeSpline, sp, ep, prop] = args;
            [sx, sy] = sp;
            [ex, ey] = ep;
        }

        const path = this.pathCalc(sx, ex, sy, ey);
        this.setProperty(nodeSpline, {...prop, d: path});
    }

    public link(sx: number, sy: number, ex: number, ey: number, prop: INodeProp): SVGElement {
        const path = this.pathCalc(sx, ex, sy, ey);
        const node = this.createElement('path', {...prop, d: path});
        return node;
    }

    private pathCalc(sx, ex, sy, ey) {
        const controlPoint1 = {x: sx + (ex - sx) / 3, y: sy};
        const controlPoint2 = {x: ex - (ex - sx) / 3, y: ey};
        const path = `M${sx} ${sy} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${ex} ${ey}`;
        return path;
    }
}
