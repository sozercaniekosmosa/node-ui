import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";
import {decompress, compress, decompressString, compressString} from '../utils'


export type TEventEditor = {
    name: 'selected' | 'dragged' | 'link-create' | 'link-remove' | 'add-node' | 'node-remove' | 'init',
    data?: any
}

export function Editor({newNode, onEvent}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const editorRef = useRef(null);

    function eventEmit(eventData: TEventEditor) {
        onEvent && onEvent(eventData as TEventEditor)
    }


    useEffect(() => {
        const nui = new NodeUI(editorRef.current! as HTMLElement)
        nuiRef.current = nui;

        //language=HTML
        nui.svg.innerHTML = '<g class="group-path" transform="translate(0,0)"><path class="link" stroke-linecap="round" d="M169.0107421875 118.11111111111111 C 176.94543306327162 118.11111111111111, 184.88012393904322 128.5185185185185, 192.81481481481484 128.5185185185185" id="uleTCCi-uleTFke"></path><path class="link" stroke-linecap="round" d="M192.81481481481484 144.5185185185185 C 185.21345727237656 144.5185185185185, 177.61209972993828 153.11110885054975, 170.0107421875 153.11110885054975" id="uleTDpr-uleTFkf"></path></g><text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">sum</text><g x="132" y="106" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXAgBBXT5DLEC8ACMCakkAtABGLj0DYhMECytrMO9fQmIA4IAhcP5iKNj4xLk0ACY02n1DLJzta3KCkFwiwRKCAGEKyOi46ga6+VQABmbWzMQOmxHPAF0uWFcwRxQMQv85YIARUarx2q4k1FTuFozBdstOs56+o6CCAFFzwWqJtNGgtHsZli8bL93n5iscCAAxP69S4Ja71OYgtrg3KIjaeIA===" transform="translate(132,106)" id="uleTCCg"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uleTCCi" data-name="out" data-to="uleTFke"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="142" y="116" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXAgBBXT5DLEC8ACMCakkAtABGLj0DYhMECytrMO9fQmIA4IAhcP5iKNj4xLk0ACY02n1DLJzta3KCkFwiwRKCAGEKyOi46ga6+VQABmbWzMQOmxHPAF0uWFcwRxQMQv85YIARUarx2q4k1FTuFozBdstOs56+o6CCAFFzwWqJtNGgtHsZli8bL93n5iscCAAxP69S4Ja71OYgtrg3KIjaeIA===" transform="translate(133,141)" id="uleTDpp"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uleTDpr" data-name="out" data-to="uleTFkf"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="198" y="132" class="node" data-node="sum" data-cfg="N4IkfCCIwgiSIIHCCKwgIBcBtUA7AhgWwKZJACY4DOAxgE4CWADgC6UD2aIANCLQJ7V6IjG1U0Ac1YgAbhgA2+QHgggfhAYgQRBADCCBeEHij6tSTxCB0EFUZA4iBx1cALRzlgARBlgHhA4gIRBrIAL4BdV0A===" transform="translate(192.8148148148148,116.40740740740742)" id="uleTFkc"><rect x="0" y="0" width="45.0107421875" height="40" rx="2" stroke="#25334b" fill="#f6e6e1" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uleTFke" data-name="A" data-to="uleTCCi"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="uleTFkf" data-name="B" data-to="uleTDpr"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="45.0107421875" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="uleTFkh" data-name="out"></circle><text x="24" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => eventEmit({name: 'selected', data: e.detail}))
        nui.svg.addEventListener('dragged', (e: CustomEvent) => eventEmit({name: 'dragged'}))
        nui.svg.addEventListener('link-create', (e: CustomEvent) => eventEmit({name: 'link-create'}))
        nui.svg.addEventListener('link-remove', (e: CustomEvent) => eventEmit({name: 'link-remove'}))
        nui.svg.addEventListener('node-remove', (e: CustomEvent) => eventEmit({name: 'node-remove'}))


        eventEmit({name: 'init', data: nuiRef.current})
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


    return <>
        <div className="editor" onMouseDown={onMouseDown} ref={editorRef} tabIndex="-1"/>
    </>;
}
