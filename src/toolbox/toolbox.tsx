import "./style.css"
import React, {useEffect, useState} from "react";
import {arrNode} from "../nodes/nodes";

export function Toolbox({onNodeSelect, controlReset}) {

    const [index, setIndex] = useState(-1)

    useEffect(() => {
        controlReset(() => () => setIndex(-1))
    }, [])

    function onMouseDown({target}) {
        let nodeIndex = target.dataset.index;
        setIndex(nodeIndex == index ? -1 : nodeIndex);
        onNodeSelect && onNodeSelect(nodeIndex == index ? null : arrNode[target.dataset.index])
    }

    return (
        <div className="toolbox" onMouseDown={onMouseDown}>
            {arrNode.map((it, i) => {
                return (
                    <div className={'toolbox__item' + (i == index ? ' toolbox__item--press' : '')} key={i}
                         data-index={i}>
                        <div className="toolbox__icon" style={{backgroundImage: it.icon}}></div>
                        <div className="toolbox__desc">{it.name}</div>
                    </div>
                )
            })}
        </div>
    )
}