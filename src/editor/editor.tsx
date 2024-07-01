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
        nui.svg.innerHTML = '<g x="64" y="49" class="node" data-node="value" data-cfg="eyJ2YWx1ZSI6MH0=" transform="translate(63,47)" id="ugSzxkh"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ugSzxkj" data-name="out" data-to="ugSzyNV"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="64" y="91" class="node" data-node="value" data-cfg="eyJ2YWx1ZSI6MH0=" transform="translate(63,89)" id="ugSzxTM"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ugSzxTO" data-name="out" data-to="ugSzyNW"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="128" y="66" class="node" data-node="sum" transform="translate(131,60)" id="ugSzyNT"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ugSzyNV" data-name="A" data-to="ugSzxkj"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ugSzyNW" data-name="B" data-to="ugSzxTO"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ugSzyNX" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><path class="link" stroke-linecap="round" d="M100.0107421875 59 C 110.34049479166667 59, 120.67024739583333 72, 131 72" id="ugSzxkj-ugSzyNV"></path><path class="link" stroke-linecap="round" d="M100.0107421875 101 C 110.34049479166667 101, 120.67024739583333 88, 131 88" id="ugSzxTO-ugSzyNW"></path>'

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