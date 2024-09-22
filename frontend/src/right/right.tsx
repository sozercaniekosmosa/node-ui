import "./style.css"
import React, {useEffect, useState} from "react";
import {Tab} from "../tab/tab";

// import {listNode} from "../../../nodes/nodes";

export function Right({onNodeSelect, listNode}) {

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

    let arrTab = [
        ['инфо', <div>123</div>, ''],
        ['log', <div>123</div>, '']
    ];
    return (
        <div className="right" onMouseDown={onMouseDown}>
            <Tab arrTab={arrTab}/>
        </div>
    )
}