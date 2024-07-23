import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";
import {MenuConfirm} from "../auxiliary/menu/menu-confirm";
import {decompress, compress, decompressString, compressString} from '../utils'

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
        nui.svg.innerHTML = '<text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">sum</text><g x="129" y="206" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXIi5efmIsQLwAIwJqSQC0AAZQ2n1DEwQLK2skrx8QXEJiAOCAQV0+Q0iYuIS5NABGVPTiTOzta0b832LBUoIAIUrwwRrY+K5E1AAmFoM2xA6bGa8AXS5YVzBHFAxe/zlgkeqoifr5VBTuNIXBdstOvO8DkqOCCtCqiLO6qYbUM0bq17ktHjZui9Cn43kEhicfrVJtIAXNgXdjGCcqsoUVDnCEWNfsjptc9BiHjlngU8bDyoTCsSLk15hksZ1ITSYf13sMvqNGUjmbNWYssuDrDiuX0UQT+achf9LmTbmzxVSetCZQNPtxvkTFbKWei1csupraTy4Xy9QLxn8jSKTWKzVLXlbjvLEeclclRaD1U8LdzZfSvQafY6geTTRLOe7Q/Dw4LI9M0TGXRK3Vr8Z7bQrUwCVSDMYGbNSEzqGfaSQDo6rMzl4zm6Un896HWn/aXXcHte9q0zfVdu5Sg7iQ1XkzXhfWS2OIX3c22wgXO6jR+yVkvW4PDaTN2XcjuPR894XLnOKVvzRP+9bz+vLumGwHe3fl4/a8rD2aKy3T11VcO2/Y0MzfOMT0TG1gIjJ80Bfecb2zS1EyA/UU3gwFf0gj9WxgjCZ2HRDryPFDJwHach0dYtSL/KCp3bODQOw50IKbBjeS/YUSNjbFOLlJjMJY2i+PHaVl3Qu1qOmK8xMXPDTwI6T9w3NieyzAS81g4ThVExtxMrd4pLXFi5IMhSJPw7jiJw/jPDWTwgA===" transform="translate(123.37037037037034,76.07407407407405)" id="ujkfe22"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujkfe24" data-name="out" data-to="ujkfj3b"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="123" y="117" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXIi5efmIsQLwAIwJqSQC0AAZQ2n1DEwQLK2skrx8QXEJiAOCAQV0+Q0iYuIS5NABGVPTiTOzta0b832LBUoIAIUrwwRrY+K5E1AAmFoM2xA6bGa8AXS5YVzBHFAxe/zlgkeqoifr5VBTuNIXBdstOvO8DkqOCCtCqiLO6qYbUM0bq17ktHjZui9Cn43kEhicfrVJtIAXNgXdjGCcqsoUVDnCEWNfsjptc9BiHjlngU8bDyoTCsSLk15hksZ1ITSYf13sMvqNGUjmbNWYssuDrDiuX0UQT+achf9LmTbmzxVSetCZQNPtxvkTFbKWei1csupraTy4Xy9QLxn8jSKTWKzVLXlbjvLEeclclRaD1U8LdzZfSvQafY6geTTRLOe7Q/Dw4LI9M0TGXRK3Vr8Z7bQrUwCVSDMYGbNSEzqGfaSQDo6rMzl4zm6Un896HWn/aXXcHte9q0zfVdu5Sg7iQ1XkzXhfWS2OIX3c22wgXO6jR+yVkvW4PDaTN2XcjuPR894XLnOKVvzRP+9bz+vLumGwHe3fl4/a8rD2aKy3T11VcO2/Y0MzfOMT0TG1gIjJ80Bfecb2zS1EyA/UU3gwFf0gj9WxgjCZ2HRDryPFDJwHach0dYtSL/KCp3bODQOw50IKbBjeS/YUSNjbFOLlJjMJY2i+PHaVl3Qu1qOmK8xMXPDTwI6T9w3NieyzAS81g4ThVExtxMrd4pLXFi5IMhSJPw7jiJw/jPDWTwgA===" transform="translate(123,117)" id="ujkfit6"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujkfit8" data-name="out" data-to="ujkfj3c"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="180" y="91" class="node" data-node="sum" data-cfg="N4IkfCCIwgiSIIHCCKwgIBcBtUA7AhgWwKZJACY4DOAxgE4CWADgC6UD2aIANCLQJ7V6IjG1U0Ac1YgAbhgA2+QHgggfhAYgQRBADCCBeEHij6tSTxCB0EFUZA4iBx1cALRzlgARBlgHhA4gIRBrIAL4BdV0A===" transform="translate(183.85185185185188,88.92592592592594)" id="ujkfj39"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#f6e6e1" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ujkfj3b" data-name="A" data-to="ujkfe24"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ujkfj3c" data-name="B" data-to="ujkfit8"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujkfj3e" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><path class="link" stroke-linecap="round" d="M160.381103515625 88.07407181351273 C 168.2046862943673 88.07407181351273, 176.02826907310958 100.92592592592592, 183.85185185185188 100.92592592592592" id="ujkfe24-ujkfj3b"></path><path class="link" stroke-linecap="round" d="M183.85185185185188 116.92592140480323 C 175.90481529706793 116.92592140480323, 167.95777874228395 128.99999095775462, 160.0107421875 128.99999095775462" id="ujkfit8-ujkfj3c"></path>';

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

            let data = {cfg: compressString(JSON.stringify(newNode.cfg))};

            nuiRef.current?.createNode({
                x, y, nodeName: newNode.name,
                arrIn: newNode.inputs, arrOut: newNode.outputs, data,
                color: newNode.color
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
