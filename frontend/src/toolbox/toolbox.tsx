import "./style.css"
import React, {useEffect, useState} from "react";

// import {listNode} from "../../../nodes/nodes";

export function Toolbox({onNodeSelect, listNode}) {

    const [index, setIndex] = useState(-1)

    useEffect(() => {
        document.addEventListener('click', ({target}) => {
            if (!(target as Element).classList.contains('toolbox__item')) {
                setIndex(-1);
                onNodeSelect && onNodeSelect(null);
            }
        })
    }, [])

    function onMouseDown(e) {
        let nodeIndex = e.target.dataset.index;
        setIndex(nodeIndex == index ? -1 : nodeIndex);
        onNodeSelect && onNodeSelect(nodeIndex == index ? null : listNode[e.target.dataset.index]);
    }

    return (
        <div className="toolbox" onMouseDown={onMouseDown}>
            {listNode.map(({icon, nodeName}, i) => {
                return (
                    <div className={'toolbox__item' + (i == index ? ' toolbox__item--press' : '')} key={i}
                         data-index={i}>
                        <div className="toolbox__icon" style={{backgroundImage: icon}}></div>
                        <div className="toolbox__desc">{nodeName}</div>
                    </div>
                )
            })}
        </div>
    )
}