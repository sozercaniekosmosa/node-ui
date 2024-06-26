import React, {useEffect, useRef} from 'react';
import './style.css';
import {NodeUI} from "./node-ui/node-ui";
import {Calc} from "./node-ui/calc";
import {Point} from "./node-ui/svg";

export default function NODEUI({addNodeToCanvas, onNodeAdded}) {
    const nuiRef = useRef<NodeUI | null>(null);
    const divRef = useRef(null);

    useEffect(() => {
        if (addNodeToCanvas) {

        }
    }, [addNodeToCanvas])

    useEffect(() => {
        const nui = new NodeUI(divRef.current! as HTMLElement)
        nuiRef.current = nui;
        nui.createNode({x: 120, y: 50, nodeName: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})
        nui.createNode({x: 50, y: 50, nodeName: 'value', arrOut: ['out']})
        nui.createNode({x: 50, y: 90, nodeName: 'value', arrOut: ['out']})

        const calc = new Calc(nui, null)

    }, []);

    function onMouseDown(e) {
        if (nuiRef.current && addNodeToCanvas) {
            const nui = nuiRef.current
            nui?.updateZoom();
            const {x, y} = nui?.getPosZoom(new Point(e.clientX, e.clientY).sub(nui?.off!));

            nuiRef.current?.createNode({
                x, y,
                nodeName: addNodeToCanvas.name,
                arrIn: addNodeToCanvas.inputs,
                arrOut: addNodeToCanvas.outputs
            });
            onNodeAdded();
        }
    }

    return <div className="editor" onMouseDown={onMouseDown} ref={divRef}/>;
}
