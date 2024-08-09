import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";
import {decompress, compress, decompressString, compressString} from '../utils'


export type TEventData = {
    name: 'selected' | 'dragged' | 'link-create' | 'link-remove' | 'add-node' | 'node-remove' | 'init',
    arrSelect?: Element[],
    nui?: NodeUI | null,
    arrKey?: string[]
}

export function Editor({newNode, onEvent}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const editorRef = useRef(null);

    function eventEmit(eventData: TEventData) {
        onEvent && onEvent(eventData as TEventData)
    }


    useEffect(() => {
        const nui = new NodeUI(editorRef.current! as HTMLElement)
        nuiRef.current = nui;

        //language=HTML
        nui.svg.innerHTML = '<text x="0" y="0" class="pin-text" opacity="0" id="temp-node-for-width-text">sum</text><g x="73" y="65" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXAgBBXT5DLEC8ACMCakkAtABGLj0DYhMECytrMO9fQmIA4IAhcP5iKNj4xLk0ACY02n1DLJzta3KCkFwiwRKCAGEKyOi46ga6+VQABmbWzMQOmxHPAF0uWFcwRxQMQv85YIARUarx2q4k1FTuFozBdstOs56+o6CCAFFzwWqJtNGgtHsZli8bL93n5iscCAAxP69S4Ja71OYgtrg3KIjaeIA===" transform="translate(73,65)" id="ukXkirQ"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ukXkirS" data-name="out" data-to="ukXkm7H"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="74" y="100" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QATAgZwGMAnASwAcAXWgeyxABoRGBPeo1CHKM6WAOacQANxwAbYoDwQQPwggDhAICKCsCsIJOaNZAkIHQQKDkDiIFs1aAtEoSABEASAeEC2AhEHsgAvh2z5DM2QBXAgBBXT5DLEC8ACMCakkAtABGLj0DYhMECytrMO9fQmIA4IAhcP5iKNj4xLk0ACY02n1DLJzta3KCkFwiwRKCAGEKyOi46ga6+VQABmbWzMQOmxHPAF0uWFcwRxQMQv85YIARUarx2q4k1FTuFozBdstOs56+o6CCAFFzwWqJtNGgtHsZli8bL93n5iscCAAxP69S4Ja71OYgtrg3KIjaeIA===" transform="translate(72.81481481481481,100.19753086419753)" id="ukXkji2"><rect x="0" y="0" width="37.0107421875" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="37.0107421875" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ukXkji4" data-name="out" data-to="ukXkm7I"></circle><text x="16" y="15" class="pin-text">out</text><text x="0" y="-2" class="pin-text">value</text></g><g x="136.84224965706443" y="85.86008230452671" class="node" data-node="sum" data-cfg="N4IkfCCIwgiSIIHCCKwgIBcBtUA7AhgWwKZJACY4DOAxgE4CWADgC6UD2aIANCLQJ7V6IjG1U0Ac1YgAbhgA2+QHgggfhAYgQRBADCCBeEHij6tSTxCB0EFUZA4iBx1cALRzlgARBlgHhA4gIRBrIAL4BdV0A===" transform="translate(134.86694101508925,74.2057613168724)" id="ukXkm7F"><rect x="0" y="0" width="43.09660720825195" height="40" rx="2" stroke="#25334b" fill="#f6e6e1" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ukXkm7H" data-name="A" data-to="ukXkirS"></circle><text x="8" y="15" class="pin-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ukXkm7I" data-name="B" data-to="ukXkji4"></circle><text x="8" y="31" class="pin-text">B</text><circle cx="43.09660720825195" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ukXkm7K" data-name="out"></circle><text x="22.518518447875977" y="23" class="pin-text">out</text><text x="0" y="-2" class="pin-text">sum</text></g><path class="link" stroke-linecap="round" d="M110.01074888545952 77.00000200938784 C 118.29614626200272 77.00000200938784, 126.58154363854591 86.20576734503598, 134.8669410150891 86.20576734503598" id="ukXkirS-ukXkm7H"></path><path class="link" stroke-linecap="round" d="M134.8669410150891 102.2057613168724 C 126.51981122470846 102.2057613168724, 118.17268143432781 112.19752684542176, 109.82555164394716 112.19752684542176" id="ukXkji4-ukXkm7I"></path>';

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


    return <>
        <div className="editor" onMouseDown={onMouseDown} ref={editorRef} tabIndex="-1"/>
    </>;
}
