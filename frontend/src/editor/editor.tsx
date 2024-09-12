import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Point} from "./node-ui/svg";
import {decompress, compress, decompressString, compressString, eventBus} from '../utils'
import {TMessage, TStatus} from "../../../general/types";


export type TEventEditor = {
    name: 'selected' | 'dragged' | 'link-create' | 'link-remove' | 'add-node' | 'node-remove' | 'init' | 'node-cmd',
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
        // nui.svg.innerHTML = '<g class="group-path" transform="translate(0,0)"><path class="link" stroke-linecap="round" d="M97.99999999999993 69.11111111111109 C 114.29629629629622 69.11111111111109, 106.14814814814807 79.44444444444441, 122.44444444444436 79.44444444444441" id="ulxoFjV-ulxoObR"></path><path class="link" stroke-linecap="round" d="M122.44444444444436 95.44444444444441 C 106.14814814814807 95.44444444444441, 114.29629629629622 105.11111111111107, 97.99999999999993 105.11111111111107" id="ulxoFIY-ulxoObS"></path></g><text x="0" y="0" class="node-text" opacity="0" id="temp-node-for-width-text">sum</text><g x="68" y="57" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QA3HAGwFcCBBEAGhABcBPAByNRC0rwCMCAJwakKaAIyMmASyblOIQOggiQOIggVhAogDhA1AWjqMcgwQHk2MgPZY06EACYQAXQC+9bPgVkqBAEIjWHYh5+IRFPNFspWXliZQR1LV1fAyNTCysMO0cXN0JiT2oAYT92BSCBQXtGMNQABki5BVj47R0i5JMzaUtrTOdXbnc8imoAcWKArjKhStFyNDrmKMbVDRax9tSu9Jt7PpyPYYIACXHS3nKZ6oWZBpiVhJ0Tjc7ujIBmLP7cXK58ggBJU6Bc7TUJiWr1aJcJqrXSA55pHofPYDH6zajw5glYHBCpguYQxa3aH3FqYwwdRHvT77IZeTH+M64y7g65LO5xWE6ckpF7bEDI7Kog70oGTEF4qqsyHLTkPHmUrZImnCukYsXcCUsgls4lKUlwkQUzavGyCr6DX6HBnY8XM/HzGUc5qGhFK6nOByMWCAIRAwIABEGQ1lpVq8ABENVNhFKCZIiVD9XKWhGhd8RdQAKKRiUO1AReOyl06LOpy3oggAMWzuNzuoTMIeVacXpAEDUPsAMiDB1VcaRsDUAZyYgmkWAA5rmQOIAJy2AB04gAbAAOOc1OcfJ29tg6BCAFhB/WoIEbeVT0J7GJooIAREDA3bTxAAJgQBwBjEd8wfD0cTmPEQB4IIA/CCaBACAJCeiqmiAo7kKORCMCOY4ABZMCISHCJ6ThAA===" transform="translate(68,57)" id="ulxoFjU"><rect x="0" y="0" width="30" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="30" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ulxoFjV" data-name="x" data-to="ulxoObR"></circle><text x="16" y="15" class="node-text">x</text><text x="0" y="-2" class="node-text">value</text></g><g x="78" y="67" class="node" data-node="value" data-cfg="N4IkfCCIIgi8IGhMIFgGEEPIgIBcBtUA7AhgWwFM0QA3HAGwFcCBBEAGhABcBPAByNRC0rwCMCAJwakKaAIyMmASyblOIQOggiQOIggVhAogDhA1AWjqMcgwQHk2MgPZY06EACYQAXQC+9bPgVkqBAEIjWHYh5+IRFPNFspWXliZQR1LV1fAyNTCysMO0cXN0JiT2oAYT92BSCBQXtGMNQABki5BVj47R0i5JMzaUtrTOdXbnc8imoAcWKArjKhStFyNDrmKMbVDRax9tSu9Jt7PpyPYYIACXHS3nKZ6oWZBpiVhJ0Tjc7ujIBmLP7cXK58ggBJU6Bc7TUJiWr1aJcJqrXSA55pHofPYDH6zajw5glYHBCpguYQxa3aH3FqYwwdRHvT77IZeTH+M64y7g65LO5xWE6ckpF7bEDI7Kog70oGTEF4qqsyHLTkPHmUrZImnCukYsXcCUsgls4lKUlwkQUzavGyCr6DX6HBnY8XM/HzGUc5qGhFK6nOByMWCAIRAwIABEGQ1lpVq8ABENVNhFKCZIiVD9XKWhGhd8RdQAKKRiUO1AReOyl06LOpy3oggAMWzuNzuoTMIeVacXpAEDUPsAMiDB1VcaRsDUAZyYgmkWAA5rmQOIAJy2AB04gAbAAOOc1OcfJ29tg6BCAFhB/WoIEbeVT0J7GJooIAREDA3bTxAAJgQBwBjEd8wfD0cTmPEQB4IIA/CCaBACAJCeiqmiAo7kKORCMCOY4ABZMCISHCJ6ThAA===" transform="translate(68,93)" id="ulxoFIW"><rect x="0" y="0" width="30" height="24" rx="2" stroke="#25334b" fill="#ebf5ec" class="handle"></rect><circle cx="30" cy="12" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ulxoFIY" data-name="x" data-to="ulxoObS"></circle><text x="16" y="15" class="node-text">x</text><text x="0" y="-2" class="node-text">value</text></g><g x="127.7777777777777" y="83.62962962962959" class="node" data-node="sum" data-cfg="N4IkfCCIwgiSIIHCCKwgIBcBtUA7AhgWwKZJACY4DOAxgE4CWADgC6UD2aIANCLQJ7V6IjG1U0Ac1YgAbhgA2+QHgggfhAYgQRBADCCBeEHij6tSTxCB0EFUZA4iBx1cALRzlgARBlgHhA4gIRBrojOXIB5Oo2YoAugC+LOjYugCOAO5hmly6aACuWABGOOSiEtKIAEwAdFlsWjr4gFggyoBcIGCAnCDmjmAABFa2Ds6u7l70TEjIgYFAA==" transform="translate(122.44444444444446,67.33333333333353)" id="ulxoObO"><rect x="0" y="0" width="35.01851844787598" height="40" rx="2" stroke="#25334b" fill="#f6e6e1" class="handle"></rect><circle cx="0" cy="12" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ulxoObR" data-name="A" data-to="ulxoFjV"></circle><text x="8" y="15" class="node-text">A</text><circle cx="0" cy="28" r="4" stroke="#25334b" fill="#bcffd6" class="pin-in" id="ulxoObS" data-name="B" data-to="ulxoFIY"></circle><text x="8" y="31" class="node-text">B</text><circle cx="35.01851844787598" cy="20" r="4" stroke="#25334b" fill="#ffc69a" class="pin-out" id="ulxoObT" data-name="y"></circle><text x="22.518518447875977" y="23" class="node-text">y</text><text x="0" y="-2" class="node-text">sum</text></g>';

        nui.svg.addEventListener('selected', (e: CustomEvent) => eventEmit({name: 'selected', data: e.detail}))
        nui.svg.addEventListener('dragged', (e: CustomEvent) => eventEmit({name: 'dragged'}))
        nui.svg.addEventListener('link-create', (e: CustomEvent) => eventEmit({name: 'link-create'}))
        nui.svg.addEventListener('link-remove', (e: CustomEvent) => eventEmit({name: 'link-remove'}))
        nui.svg.addEventListener('node-remove', (e: CustomEvent) => eventEmit({name: 'node-remove'}))
        nui.svg.addEventListener('node-cmd', (e: CustomEvent) => eventEmit({name: 'node-cmd', data: e.detail}))

        eventEmit({name: 'init', data: nuiRef.current})

        eventBus.addEventListener('message-socket', ({type, data}: TMessage) => {
            switch (type) {
                case "node-status":
                    const {id, state} = data as TStatus;
                    const node = nui.svg.querySelector(`#${id}`);
                    if (node) {
                        const nodeDest = node.querySelector(`.node-status`)
                        let fill = '#dcdcdc';
                        if (state) {
                            (state === 'run') && (fill = '#00ff3c');
                            (state === 'error') && (fill = '#ff006a');
                            (state === 'stop') && (fill = '#dcdcdc');
                        }
                        nui.setProperty(nodeDest, {fill})
                        nui.setProperty(node, {data: {state}})
                    } else {
                        console.log(type, state)
                    }
                    break;
            }
        })
    }, []);

    function onMouseDown(e) {
        if (nuiRef.current && newNode) {
            const nui = nuiRef.current;
            nui?.updateZoom();
            const {x, y} = nui?.getPosZoom(new Point(e.clientX, e.clientY).sub(nui?.off!));
            nuiRef.current?.createNode({x, y, ...newNode});
            eventEmit({name: 'add-node'})
        }
    }


    return <>
        <div className="editor" onMouseDown={onMouseDown} ref={editorRef} tabIndex={-1}/>
    </>;
}
