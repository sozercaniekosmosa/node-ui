import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";
import {MenuConfirm} from "../auxiliary/menu/menu-confirm";

let arrKey = [];


export type TEventData = {
    name: 'selected' | 'dragged' | 'link-create' | 'link-remove' | 'add-node' | 'node-remove' | 'init' | 'key-down' | 'key-up',
    arrSelect?: Element[],
    nui?: NodeUI | null,
    arrKey?: string[]
}

export function Editor({newNode, onEvent}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const editorRef = useRef(null);
    const [confirmShow, setConfirmShow] = useState(() => () => true);

    function eventEmit(eventData: TEventData) {
        onEvent && onEvent(eventData as TEventData)
    }

    useEffect(() => {
        const nui = new NodeUI(editorRef.current! as HTMLElement)
        nuiRef.current = nui;
        //language=HTML
        nui.svg.innerHTML = '<text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">value</text><g x="224" y="89" class="node" data-node="sum" data-description="Сумма" transform="translate(196.99999999999994,138.6296296296297)" id="uhqErub"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uhqErud" data-name="A" data-to="uhyEYfM"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uhqEruf" data-name="B" data-to="uhyF1n0"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhqErug" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><g x="113" y="225" class="node" data-node="value" data-cfg="JTI1N0IlMjUyMiUyNUQwJTI1QkUlMjVEMSUyNTgxJTI1RDAlMjVCRCUyNUQwJTI1QkUlMjVEMCUyNUIyJTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNThGJTI1MjIlMjUzQSUyNTVCJTI1N0IlMjUyMm5hbWUlMjUyMiUyNTNBJTI1MjJkZXNjcmlwdGlvbiUyNTIyJTI1MkMlMjUyMnR5cGUlMjUyMiUyNTNBJTI1MjJzdHJpbmclMjUyMiUyNTJDJTI1MjJ2YWwlMjUyMiUyNTNBJTI1MjIlMjVEMCUyNTlFJTI1RDAlMjVCRiUyNUQwJTI1QjglMjVEMSUyNTgxJTI1RDAlMjVCMCUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNSUyNTIyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkRhJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtJTI1RDAlMjVCRiUyNUQwJTI1QjAlMjVEMSUyNTgwJTI1RDAlMjVCMCUyNUQwJTI1QkMlMjVEMCUyNUI1JTI1RDElMjU4MiUyNUQxJTI1ODAlMjUyMiUyNTdEJTI1MkMlMjU3QiUyNTIybmFtZSUyNTIyJTI1M0ElMjUyMnZhbHVlJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EwJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMCUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVBJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0ExJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMSUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1N0QlMjU1RCUyNTJDJTI1MjIlMjVEMCUyNUIyJTI1RDElMjU4MiUyNUQwJTI1QkUlMjVEMSUyNTgwJTI1RDAlMjVCMCUyNUQxJTI1OEYlMjUyMiUyNTNBJTI1NUIlMjU3QiUyNTIybmFtZSUyNTIyJTI1M0ElMjUyMnZhbHVlJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EwJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMCUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVBJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0ExJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMSUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1N0QlMjU1RCUyNTdE" transform="translate(135,124)" id="uhyEYfK"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhyEYfM" data-name="out" data-to="uhqErud"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="129" y="290" class="node" data-node="value" data-cfg="JTI1N0IlMjUyMiUyNUQwJTI1QkUlMjVEMSUyNTgxJTI1RDAlMjVCRCUyNUQwJTI1QkUlMjVEMCUyNUIyJTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNThGJTI1MjIlMjUzQSUyNTVCJTI1N0IlMjUyMm5hbWUlMjUyMiUyNTNBJTI1MjJkZXNjcmlwdGlvbiUyNTIyJTI1MkMlMjUyMnR5cGUlMjUyMiUyNTNBJTI1MjJzdHJpbmclMjUyMiUyNTJDJTI1MjJ2YWwlMjUyMiUyNTNBJTI1MjIlMjVEMCUyNTlFJTI1RDAlMjVCRiUyNUQwJTI1QjglMjVEMSUyNTgxJTI1RDAlMjVCMCUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNSUyNTIyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkRhJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtJTI1RDAlMjVCRiUyNUQwJTI1QjAlMjVEMSUyNTgwJTI1RDAlMjVCMCUyNUQwJTI1QkMlMjVEMCUyNUI1JTI1RDElMjU4MiUyNUQxJTI1ODAlMjUyMiUyNTdEJTI1MkMlMjU3QiUyNTIybmFtZSUyNTIyJTI1M0ElMjUyMnZhbHVlJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EwJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMCUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVBJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0ExJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMSUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1N0QlMjU1RCUyNTJDJTI1MjIlMjVEMCUyNUIyJTI1RDElMjU4MiUyNUQwJTI1QkUlMjVEMSUyNTgwJTI1RDAlMjVCMCUyNUQxJTI1OEYlMjUyMiUyNTNBJTI1NUIlMjU3QiUyNTIybmFtZSUyNTIyJTI1M0ElMjUyMnZhbHVlJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EwJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMCUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVBJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0ExJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMSUyNTIyJTI1N0QlMjUyQyUyNTdCJTI1MjJuYW1lJTI1MjIlMjUzQSUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIydHlwZSUyNTIyJTI1M0ElMjUyMm51bWJlciUyNTIyJTI1MkMlMjUyMnZhbCUyNTIyJTI1M0EyJTI1MkMlMjUyMnRpdGxlJTI1MjIlMjUzQSUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1N0QlMjU1RCUyNTdE" transform="translate(135,166)" id="uhyF1mY"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhyF1n0" data-name="out" data-to="uhqEruf"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><path class="link" stroke-linecap="round" d="M197 150.62962341308594 C 188.67024739583334 150.62962341308594, 180.34049479166666 136, 172.0107421875 136" id="uhyEYfM-uhqErud"></path><path class="link" stroke-linecap="round" d="M197 166.62962341308594 C 188.67024739583334 166.62962341308594, 180.34049479166666 178, 172.0107421875 178" id="uhyF1n0-uhqEruf"></path>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => eventEmit({name: 'selected', arrSelect: e.detail}))
        nui.svg.addEventListener('dragged', (e: CustomEvent) => eventEmit({name: 'dragged'}))
        nui.svg.addEventListener('link-create', (e: CustomEvent) => eventEmit({name: 'link-create'}))
        nui.svg.addEventListener('link-remove', (e: CustomEvent) => eventEmit({name: 'link-remove'}))
        nui.svg.addEventListener('node-remove', (e: CustomEvent) => eventEmit({name: 'node-remove'}))

        eventEmit({name: 'init', nui: nuiRef.current})
    }, []);

    function onMouseDown(e) {
        if (nuiRef.current && newNode) {
            const nui = nuiRef.current;
            nui?.updateZoom();
            const {x, y} = nui?.getPosZoom(new Point(e.clientX, e.clientY).sub(nui?.off!));

            let data = {cfg: toBase64(JSON.stringify(newNode.cfg))};

            nuiRef.current?.createNode({
                x, y, nodeName: newNode.name, arrIn: newNode.inputs, arrOut: newNode.outputs, data
            });
            eventEmit({name: 'add-node'})
        }
    }

    function onKeyDown(e) {
        arrKey[e.code.toLowerCase()] = true;
        if (arrKey['delete']) nuiRef.current?.selection.arrSelected!.length > 0 && confirmShow();
        eventEmit({name: 'key-down', arrKey});
    }

    function onKeyUp(e) {
        arrKey[e.code.toLowerCase()] = false;
        eventEmit({name: 'key-up', arrKey});
    }

    return <>
        <div className="editor" onMouseDown={onMouseDown} ref={editorRef} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
             tabIndex="-1"/>
    </>;
}

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));
