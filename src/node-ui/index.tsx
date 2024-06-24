import React, {useEffect, useRef} from 'react';
import './style.css';
import {NodeUI as NODEUI} from "./node-ui";
import {Calc} from "./node-ui/calc";
import {Property} from "./property";

export default function NodeUI() {

    const divRef = useRef(null);

    useEffect(() => {
        console.log(divRef); // Выводит <div> DOM узел в консоль

        //language=HTML
        // nui.svg.innerHTML = '<text x="0" y="0" class="pinText" opacity="0">out</text><g x="50" y="50" class="node" data-node="value" transform="translate(50,50)" id="ufFCx6a"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6c" data-to="ufFCx6i"></circle><text x="16" y="15" class="pinText">out</text></g><g x="50" y="80" class="node" data-node="value" transform="translate(50,80)" id="ufFCx6d"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6f" data-to="ufFCx6j"></circle><text x="16" y="15" class="pinText">out</text></g><g x="120" y="50" class="node" data-node="sum" transform="translate(120,50)" id="ufFCx6g"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufFCx6i" data-to="ufFCx6c"></circle><text x="8" y="15" class="pinText">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ufFCx6j" data-to="ufFCx6f"></circle><text x="8" y="31" class="pinText">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ufFCx6k"></circle><text x="24" y="23" class="pinText">out</text></g><path class="link" stroke-linecap="round" d="M87.0107421875 62 C 98.00716145833333 62, 109.00358072916667 62, 120 62" id="ufFCx6c-ufFCx6i"></path><path class="link" stroke-linecap="round" d="M120 78 C 109.00358072916667 78, 98.00716145833333 92, 87.0107421875 92" id="ufFCx6f-ufFCx6j"></path>'

        const nui = new NODEUI(divRef.current! as HTMLElement)
        nui.createNode({x: 120, y: 50, nodeName: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})
        nui.createNode({x: 50, y: 50, nodeName: 'value', arrOut: ['out']})
        nui.createNode({x: 50, y: 90, nodeName: 'value', arrOut: ['out']})

        const calc = new Calc(nui, null)

    }, []);
    return (
        <div className="editor" ref={divRef}>
            <Property />
        </div>
    );
}
