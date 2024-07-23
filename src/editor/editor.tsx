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
        nui.svg.innerHTML = '<text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">sum</text><g x="105" y="78" class="node" data-node="value" data-cfg="N4IkTCCEIgh8IIAiCAwgh5EBALgNqgHYEMC2BTFEANywBsBXAgGhABcBPABwORA3JwCM8AnEGkqRQAGGrQCWtUixCB0EEC8IHEDiIIFYQeYA4QFQFphIAL5VMuGYMoBBfnSYz2XXpcEoAjGMnTCC5Ws1an+w2zGhKZ4AEKWDMyEttx8AmQoAEyuUjKeqhraif5G+MFklBHW0RyxDgnIonRuaYoZProGuSYFeBZixawx9vFCyC7VqR513tp+TYF5rCHhHVFdpT3EFcmD7qzpo1rZE9hTyxTUVvNsi3EHIinrciOZOjmTLYftxzZn5X0DEkMbtz7jAT2T0os1eJTs50cyFW32umzuO0BQWmrSKJ26kIqVVhtS8d0aSP2IRekTeEI+ziuuPqYweQPyh1BpPBZV6SSpwzxPkRzQZhTmZNZF0qHN+XO0BN5KOeaMFSyhXxqnJpvjpyIOINlLPlK1FN3F2zVRNRAu1mL62KVYpVksefLaWoW5LZ/T18P+RuBYUdp2dwphVv1Kp5dul/LBTqFUMtPyDW1t9LDDtNkZ1nzdf1pu3VMx9GIp0IzBpDiY1R2ZqfNlzW1PjnvtJM6vqjFUVsfdWcJXqZTfzLoD7czhuzxplKebacpNeVWwBUrLPfR737ReD9aTeeXwpjcKHCZzrUbS79CtXs/XC83J910+tWxLB8OV5bFrP+IvxOfk9dt7jdznoaXuOfb+m+3IfiaEYTlWIq/h29wjl6R5yjBba7gaAGlrmwFblCA7oWuegALo0FAgCCIPIUBgIoSBoPOAAmeAAM4AMY8OIjASAA9hgPpMbQ7EYAA5gWICAHgggD8IOoZFwJkESBgoWAqhJcDwIAPCAqBAMAQU+OHXq+cF7jp5hfqhYGdvO2FQSBeHmcORF6EAA" transform="translate(106.7119341563786,78)" id="ujfUGk4"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d5f5d6" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujfUGk6" data-name="out" data-to="ujfUHL9"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="107" y="113" class="node" data-node="value" data-cfg="N4IkTCCEIgh8IIAiCAwgh5EBALgNqgHYEMC2BTFEANywBsBXAgGhABcBPABwORA3JwCM8AnEGkqRQAGGrQCWtUixCB0EEC8IHEDiIIFYQeYA4QFQFphIAL5VMuGYMoBBfnSYz2XXpcEoAjGMnTCC5Ws1an+w2zGhKZ4AEKWDMyEttx8AmQoAEyuUjKeqhraif5G+MFklBHW0RyxDgnIonRuaYoZProGuSYFeBZixawx9vFCyC7VqR513tp+TYF5rCHhHVFdpT3EFcmD7qzpo1rZE9hTyxTUVvNsi3EHIinrciOZOjmTLYftxzZn5X0DEkMbtz7jAT2T0os1eJTs50cyFW32umzuO0BQWmrSKJ26kIqVVhtS8d0aSP2IRekTeEI+ziuuPqYweQPyh1BpPBZV6SSpwzxPkRzQZhTmZNZF0qHN+XO0BN5KOeaMFSyhXxqnJpvjpyIOINlLPlK1FN3F2zVRNRAu1mL62KVYpVksefLaWoW5LZ/T18P+RuBYUdp2dwphVv1Kp5dul/LBTqFUMtPyDW1t9LDDtNkZ1nzdf1pu3VMx9GIp0IzBpDiY1R2ZqfNlzW1PjnvtJM6vqjFUVsfdWcJXqZTfzLoD7czhuzxplKebacpNeVWwBUrLPfR737ReD9aTeeXwpjcKHCZzrUbS79CtXs/XC83J910+tWxLB8OV5bFrP+IvxOfk9dt7jdznoaXuOfb+m+3IfiaEYTlWIq/h29wjl6R5yjBba7gaAGlrmwFblCA7oWuegALo0FAgCCIPIUBgIoSBoPOAAmeAAM4AMY8OIjASAA9hgPpMbQ7EYAA5gWICAHgggD8IOoZFwJkESBgoWAqhJcDwIAPCAqBAMAQU+OHXq+cF7jp5hfqhYGdvO2FQSBeHmcORF6EAA" transform="translate(107,113)" id="ujfUH9H"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#d5f5d6" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujfUH9J" data-name="out" data-to="ujfUHLa"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="176" y="98" class="node" data-node="sum" data-cfg="N4IkfCCIwgiSIIHCCKwgIBcBtUA7AhgWwKZJACY4DOAxgE4CWADgC6UD2aIANCLQJ7V6IjG1U0Ac1YgAbhgA2+QHgggfhAYgQRBADCCBeEHij6tSTxCB0EFUZA4iBx1cALRzlgARBlgHhA4gIRBrIAL4BdV0A===" transform="translate(165.00000000000006,88.33333333333334)" id="ujfUHL7"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#ffeee9" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ujfUHL9" data-name="A" data-to="ujfUGk6"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ujfUHLa" data-name="B" data-to="ujfUH9J"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ujfUHLb" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><path class="link" stroke-linecap="round" d="M143.72267790673578 90.00001155398023 C 150.81511904171842 90.00001155398023, 157.90756017670108 100.33334488731356, 165.00000131168372 100.33334488731356" id="ujfUGk6-ujfUHL9"></path><path class="link" stroke-linecap="round" d="M144.01074349918372 125.00001155398022 C 151.00716277001706 125.00001155398022, 158.00358204085038 116.33334488731356, 165.00000131168372 116.33334488731356" id="ujfUH9J-ujfUHLa"></path>';

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
