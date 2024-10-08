import {Point, Svg, TMouseEvent} from "../svg";
import {NodeSelector, NodeUI} from "../node-ui";

export class EditorLinkCreate {


    public nodeStart: SVGElement | null = null;
    private nodeLink: SVGElement | null = null;

    private nodeUnitDrag: SVGElement | null = null;
    private readonly svg: SVGElement;

    constructor(private nu: NodeUI) {
        this.svg = nu.svg;

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
        const gpath = this.svg.querySelector('.' + NodeSelector.path)
        node && gpath.removeChild(node as Element);
    }

    public updateConnection() {

        // получаем все конекторы на выделенных nod-ах
        let selector = `.${NodeSelector.selected}>.${NodeSelector.pinIn},.${NodeSelector.selected}>.${NodeSelector.pinOut}`;
        const arrConnector = this.svg.querySelectorAll(selector) as NodeListOf<HTMLElement>

        arrConnector.forEach(({id, dataset}) => {
            if (dataset.to) {
                const arrTo = new Set(dataset.to.split(' '));
                arrTo.forEach(idTo => {
                    const [nodeSrcConn, nodeDestConn] = this.svg.querySelectorAll(`#${id},#${idTo}`);
                    const nodeLink = this.svg.querySelector(`#${id}-${idTo},#${idTo}-${id}`);
                    if (nodeLink) {
                        const start = this.nu.getCentrePos(nodeSrcConn);
                        const end = this.nu.getCentrePos(nodeDestConn);
                        this.nu.updateLink(nodeLink as SVGElement, start, end);
                    }
                })
            }
        })
    }

    public handlerMouseDown({target, targetDownCentre: c}: TMouseEvent): void {
        const clickTarget = target as SVGElement;
        this.nodeUnitDrag = clickTarget.parentElement?.querySelector('.' + NodeSelector.handle) as SVGElement;
        if (clickTarget.classList.contains(NodeSelector.pinIn) || clickTarget.classList.contains(NodeSelector.pinOut)) {
            this.nu.setMode('link-create');
            this.nodeStart = clickTarget; //запоминаем коннектор
            const gpath = this.svg.querySelector('.' + NodeSelector.path)
            this.nodeLink = this.nu.link(c.x, c.y, c.x, c.y, {
                class: NodeSelector.link, strokeLinecap: 'round',
                to: gpath
            })
        }
    }

    public handlerMouseMove({button, p, targetDownCentre: c}: TMouseEvent): void {
        if (!button[0]) this.nu.resetMode('link-create');
        if (this.nu.isMode('link-create') && (this.nodeStart)) {
            this.nu.updateLink(this.nodeLink as SVGElement, c, p)
        } else if (this.nodeUnitDrag) {
            this.updateConnection();
        }
    }

    public handlerMouseUp({target, targetDownCentre: sc, targetUpCentre: ec}: TMouseEvent): void {

        if (!this.nodeStart) return;

        const nodeEnd = target as SVGElement;

        const idLink = nodeEnd.classList.contains(NodeSelector.pinIn) ? this.nodeStart.id + '-' + nodeEnd.id : nodeEnd.id + '-' + this.nodeStart.id;

        const isNotExist = !this.svg.querySelector('#' + idLink); //проверка такой уже есть?
        const isEndOut = nodeEnd.classList.contains(NodeSelector.pinOut);
        const isEndIn = nodeEnd.classList.contains(NodeSelector.pinIn);
        const isStartIn = this.nodeStart.classList.contains(NodeSelector.pinIn);
        const isStartOut = this.nodeStart.classList.contains(NodeSelector.pinOut);

        if (((isStartIn && isEndOut) || (isStartOut && isEndIn)) && isNotExist) { // подключение к пину

            this.nu.updateLink(this.nodeLink as SVGElement, sc, ec)
            this.updateConnectors(this.nodeStart, nodeEnd)
            this.nodeLink!.id = idLink;

            this.svg.dispatchEvent(new CustomEvent('link-create', {detail: {}}));
        } else {
            this.removeNode(this.nodeLink as SVGElement);
        }
        this.nodeLink = null;
        this.nodeStart = null;
        this.nodeUnitDrag = null;
    }

    public updateConnectors(nodeStart: SVGElement, nodeEnd: SVGElement) {
        const setEndTo = new Set(nodeEnd.dataset?.to ? nodeEnd?.dataset.to.split(' ') : []);
        setEndTo.add(nodeStart!.id)
        nodeEnd.dataset.to = [...setEndTo].join(' ');
        const setStartTo = new Set(nodeStart?.dataset.to ? nodeStart?.dataset.to.split(' ') : []);
        setStartTo.add(nodeEnd.id)
        nodeStart.dataset.to = [...setStartTo].join(' ');
    }
}

