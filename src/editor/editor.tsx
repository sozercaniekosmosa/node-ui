import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";
import {MenuConfirm} from "../auxiliary/menu/menu-confirm";

let key = [];

export default function Editor({addNodeToCanvas, onNodeAdded, controlRemove, onSelect}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const divRef = useRef(null);
    const [confirmShow, setConfirmShow] = useState(() => () => true);
    let arrSelect = [];

    useEffect(() => {
        const nui = new NodeUI(divRef.current! as HTMLElement)
        nuiRef.current = nui;
        controlRemove(() => () => nui.removeNode())
        //language=HTML
        nui.svg.innerHTML = '<g x="231" y="75" class="node" data-node="sum" transform="translate(209,85)" id="uheY2M1"> <rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect> <circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uheY2M3" data-name="A" data-to="uhi6ONn"></circle> <text x="8" y="15" class="pin-text">A</text> <circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uheY2M4" data-name="B" data-to="uhi6Pgc"></circle> <text x="8" y="31" class="pin-text">B</text> <circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uheY2M6" data-name="out"></circle> <text x="24" y="23" class="pin-text">out</text> <text x="0" y="-2" class="pin-text">sum</text> </g>    <text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">value</text><g x="149" y="69" class="node" data-node="value" data-cfg="JTI1NUIlMjU1QiUyNTIydmFsdWUlMjUyMiUyNTJDJTI1MjJudW1iZXIlMjUyMiUyNTJDMCUyNTJDJTI1MjIlMjVEMCUyNTk3JTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNTg3JTI1RDAlMjVCNSUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNS0wJTI1MjIlMjU1RCUyNTJDJTI1NUIlMjUyMnZhbHVlQSUyNTIyJTI1MkMlMjUyMm51bWJlciUyNTIyJTI1MkMxJTI1MkMlMjUyMiUyNUQwJTI1OTclMjVEMCUyNUJEJTI1RDAlMjVCMCUyNUQxJTI1ODclMjVEMCUyNUI1JTI1RDAlMjVCRCUyNUQwJTI1QjglMjVEMCUyNUI1LTElMjUyMiUyNTVEJTI1MkMlMjU1QiUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIybnVtYmVyJTI1MjIlMjUyQzIlMjUyQyUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1NUQlMjU1RA==" transform="translate(149,69)" id="uhi6ONl"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhi6ONn" data-name="out" data-to="uheY2M3"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="151" y="119" class="node" data-node="value" data-cfg="JTI1NUIlMjU1QiUyNTIydmFsdWUlMjUyMiUyNTJDJTI1MjJudW1iZXIlMjUyMiUyNTJDMCUyNTJDJTI1MjIlMjVEMCUyNTk3JTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNTg3JTI1RDAlMjVCNSUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNS0wJTI1MjIlMjU1RCUyNTJDJTI1NUIlMjUyMnZhbHVlQSUyNTIyJTI1MkMlMjUyMm51bWJlciUyNTIyJTI1MkMxJTI1MkMlMjUyMiUyNUQwJTI1OTclMjVEMCUyNUJEJTI1RDAlMjVCMCUyNUQxJTI1ODclMjVEMCUyNUI1JTI1RDAlMjVCRCUyNUQwJTI1QjglMjVEMCUyNUI1LTElMjUyMiUyNTVEJTI1MkMlMjU1QiUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIybnVtYmVyJTI1MjIlMjUyQzIlMjUyQyUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1NUQlMjU1RA==" transform="translate(150,115)" id="uhi6Pgb"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhi6Pgc" data-name="out" data-to="uheY2M4"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><path class="link" stroke-linecap="round" d="M209 97 C 201.3369140625 97, 193.673828125 81, 186.0107421875 81" id="uhi6ONn-uheY2M3"></path><path class="link" stroke-linecap="round" d="M209 113 C 201.67024739583334 113, 194.34049479166666 127, 187.0107421875 127" id="uhi6Pgc-uheY2M4"></path>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => {
            arrSelect = e.detail;
            onSelect && onSelect(e.detail);
        })

        // nui.createNode({x: 120, y: 50, nodeName: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})
        // nui.createNode({x: 50, y: 50, nodeName: 'value', arrOut: ['out']})
        // nui.createNode({x: 50, y: 90, nodeName: 'value', arrOut: ['out']})
        //
        // const calc = new Calc(nui, null)

    }, []);

    function onMouseDown(e) {
        if (nuiRef.current && addNodeToCanvas) {
            const nui = nuiRef.current;
            nui?.updateZoom();
            const {x, y} = nui?.getPosZoom(new Point(e.clientX, e.clientY).sub(nui?.off!));

            let data;
            if (addNodeToCanvas?.cfg) data = {cfg: toBase64(JSON.stringify(addNodeToCanvas.cfg))};

            nuiRef.current?.createNode({
                x, y,
                nodeName: addNodeToCanvas.name,
                description: addNodeToCanvas.description,
                arrIn: addNodeToCanvas.inputs,
                arrOut: addNodeToCanvas.outputs,
                data
            });
            onNodeAdded();
        }
    }

    function onKeyDown(e) {
        key[e.code.toLowerCase()] = true;
        if (key['delete']) nuiRef.current?.selection.arrSelected!.length > 0 && confirmShow();
        if (key['f5'] || key['f12']) return
    }

    function onKeyUp(e) {
        key[e.code.toLowerCase()] = false;
    }

    return <>
        <div className="editor" onMouseDown={onMouseDown} ref={divRef} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
             tabIndex="-1"/>
        <MenuConfirm controlShow={setConfirmShow} onClickYes={() => nuiRef.current?.removeNode()}>Уверены?</MenuConfirm>
    </>;
}

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));
