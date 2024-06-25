import React, {useEffect, useRef} from 'react';
import './style.css';
import {NodeUI as nodeui} from "./node-ui";
import {Calc} from "./node-ui/calc";

export default function NodeUi({addNode}) {

    const divRef = useRef(null);
    useEffect(() => {
        console.log(addNode)
    }, [addNode])

    useEffect(() => {
        // console.log(divRef); // Выводит <div> DOM узел в консоль

        const nui = new nodeui(divRef.current! as HTMLElement)
        nui.createNode({x: 120, y: 50, nodeName: 'sum', arrIn: ['A', 'B'], arrOut: ['out']})
        nui.createNode({x: 50, y: 50, nodeName: 'value', arrOut: ['out']})
        nui.createNode({x: 50, y: 90, nodeName: 'value', arrOut: ['out']})

        const calc = new Calc(nui, null)

    }, []);
    return <div className="editor" ref={divRef}/>;
}
