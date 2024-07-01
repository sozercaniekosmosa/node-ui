import React, {useEffect, useRef} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";

export default function Editor({addNodeToCanvas, onNodeAdded, controlRemove, onSelect}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const divRef = useRef(null);

    useEffect(() => {
        const nui = new NodeUI(divRef.current! as HTMLElement)
        nuiRef.current = nui;
        controlRemove(() => () => nui.removeNode())
        //language=HTML
        nui.svg.innerHTML = '<g x="231" y="75" class="node selected" data-node="sum" transform="translate(209,80)" id="uheY2M1"> <rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect> <circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uheY2M3" data-name="A" data-to="uheY3cJ"></circle> <text x="8" y="15" class="pin-text">A</text> <circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uheY2M4" data-name="B" data-to="uheY4Id"></circle> <text x="8" y="31" class="pin-text">B</text> <circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uheY2M6" data-name="out"></circle> <text x="24" y="23" class="pin-text">out</text> <text x="0" y="-2" class="pin-text">sum</text> </g> <g x="130" y="64" class="node" data-node="value" data-cfg="W1sidmFsdWUiLCJudW1iZXIiLDBdLFsidmFsdWVBIiwibnVtYmVyIiwxXSxbInZhbHVlQiIsIm51bWJlciIsMl1d" transform="translate(138,64)" id="uheY3cH"> <rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect> <circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uheY3cJ" data-name="out" data-to="uheY2M3"></circle> <text x="16" y="15" class="pin-text">out</text> <text x="0" y="-2" class="pin-text">value</text> </g> <g x="130" y="111" class="node" data-node="value" data-cfg="W1sidmFsdWUiLCJudW1iZXIiLDBdLFsidmFsdWVBIiwibnVtYmVyIiwxXSxbInZhbHVlQiIsIm51bWJlciIsMl1d" transform="translate(139,111)" id="uheY4Ia"> <rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect> <circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uheY4Id" data-name="out" data-to="uheY2M4"></circle> <text x="16" y="15" class="pin-text">out</text> <text x="0" y="-2" class="pin-text">value</text> </g> <path class="link" stroke-linecap="round" d="M175.0107421875 76 C 186.34049479166666 76, 197.67024739583334 92, 209 92" id="uheY3cJ-uheY2M3"></path> <path class="link" stroke-linecap="round" d="M209 108 C 198.00358072916666 108, 187.00716145833334 123, 176.0107421875 123" id="uheY4Id-uheY2M4"></path>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => {
            onSelect(e.detail)
        })

        // nui.createNode({x: 120, y: 50, nodeName: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})
        // nui.createNode({x: 50, y: 50, nodeName: 'value', arrOut: ['out']})
        // nui.createNode({x: 50, y: 90, nodeName: 'value', arrOut: ['out']})
        //
        // const calc = new Calc(nui, null)

    }, []);

    function onMouseDown(e) {
        if (nuiRef.current && addNodeToCanvas) {
            const nui = nuiRef.current
            nui?.updateZoom();
            const {x, y} = nui?.getPosZoom(new Point(e.clientX, e.clientY).sub(nui?.off!));

            let data;
            if (addNodeToCanvas?.cfg) data = {cfg: toBase64(JSON.stringify(addNodeToCanvas.cfg))};

            nuiRef.current?.createNode({
                x, y,
                nodeName: addNodeToCanvas.name,
                arrIn: addNodeToCanvas.inputs,
                arrOut: addNodeToCanvas.outputs,
                data
            });
            onNodeAdded();
        }
    }

    return <div className="editor" onMouseDown={onMouseDown} ref={divRef}/>;
}

export const toBase64 = (value: string) => window.btoa(decodeURIComponent((encodeURIComponent(value))));
export const base64to = (value: string) => window.atob(value);