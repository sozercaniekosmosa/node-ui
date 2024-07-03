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
    let arrSelect = [];

    function eventEmit(eventData: TEventData) {
        onEvent && onEvent(eventData as TEventData)
    }

    useEffect(() => {
        const nui = new NodeUI(editorRef.current! as HTMLElement)
        nuiRef.current = nui;
        //language=HTML
        nui.svg.innerHTML = '<text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">value</text><g x="142" y="111" class="node" data-node="value" data-description="Значение" data-cfg="JTI1NUIlMjU1QiUyNTIydmFsdWUlMjUyMiUyNTJDJTI1MjJudW1iZXIlMjUyMiUyNTJDMCUyNTJDJTI1MjIlMjVEMCUyNTk3JTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNTg3JTI1RDAlMjVCNSUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNS0wJTI1MjIlMjU1RCUyNTJDJTI1NUIlMjUyMnZhbHVlQSUyNTIyJTI1MkMlMjUyMm51bWJlciUyNTIyJTI1MkMxJTI1MkMlMjUyMiUyNUQwJTI1OTclMjVEMCUyNUJEJTI1RDAlMjVCMCUyNUQxJTI1ODclMjVEMCUyNUI1JTI1RDAlMjVCRCUyNUQwJTI1QjglMjVEMCUyNUI1LTElMjUyMiUyNTVEJTI1MkMlMjU1QiUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIybnVtYmVyJTI1MjIlMjUyQzIlMjUyQyUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1NUQlMjU1RA==" transform="translate(142.8888888888889,113.66666666666666)" id="uhqEr4l"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhqEr4n" data-name="out" data-to="uhqErud"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="224" y="89" class="node" data-node="sum" data-description="Сумма" transform="translate(207,126)" id="uhqErub"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uhqErud" data-name="A" data-to="uhqEr4n"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uhqEruf" data-name="B" data-to="uhqErWX"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhqErug" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><g x="142" y="157" class="node" data-node="value" data-description="Значение" data-cfg="JTI1NUIlMjU1QiUyNTIydmFsdWUlMjUyMiUyNTJDJTI1MjJudW1iZXIlMjUyMiUyNTJDMCUyNTJDJTI1MjIlMjVEMCUyNTk3JTI1RDAlMjVCRCUyNUQwJTI1QjAlMjVEMSUyNTg3JTI1RDAlMjVCNSUyNUQwJTI1QkQlMjVEMCUyNUI4JTI1RDAlMjVCNS0wJTI1MjIlMjU1RCUyNTJDJTI1NUIlMjUyMnZhbHVlQSUyNTIyJTI1MkMlMjUyMm51bWJlciUyNTIyJTI1MkMxJTI1MkMlMjUyMiUyNUQwJTI1OTclMjVEMCUyNUJEJTI1RDAlMjVCMCUyNUQxJTI1ODclMjVEMCUyNUI1JTI1RDAlMjVCRCUyNUQwJTI1QjglMjVEMCUyNUI1LTElMjUyMiUyNTVEJTI1MkMlMjU1QiUyNTIydmFsdWVCJTI1MjIlMjUyQyUyNTIybnVtYmVyJTI1MjIlMjUyQzIlMjUyQyUyNTIyJTI1RDAlMjU5NyUyNUQwJTI1QkQlMjVEMCUyNUIwJTI1RDElMjU4NyUyNUQwJTI1QjUlMjVEMCUyNUJEJTI1RDAlMjVCOCUyNUQwJTI1QjUtMiUyNTIyJTI1NUQlMjU1RA==" transform="translate(143.18518518518522,154.62962962962962)" id="uhqErWV"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d7d7d7" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uhqErWX" data-name="out" data-to="uhqEruf"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><path class="link" stroke-linecap="round" d="M179.8996310763889 125.6666542335793 C 188.93308738425927 125.6666542335793, 197.96654369212965 137.9999954788773, 207 137.9999954788773" id="uhqEr4n-uhqErud"></path><path class="link" stroke-linecap="round" d="M207 153.9999954788773 C 198.0653091242284 153.9999954788773, 189.13061824845678 166.62961380570022, 180.1959273726852 166.62961380570022" id="uhqErWX-uhqEruf"></path>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => eventEmit({name: 'selected', arrSelect}))
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

            let data;
            if (newNode?.cfg) data = {
                cfg: toBase64(JSON.stringify(newNode.cfg)),
                description: newNode.description
            };

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
        <MenuConfirm controlShow={setConfirmShow} onClickYes={() => nuiRef.current?.removeNode()}>Уверены?</MenuConfirm>
    </>;
}

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));
