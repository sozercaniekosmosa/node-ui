import "./style.css"
import React, {useEffect, useState} from "react";
import {arrNode} from "../nodes/nodes";

export function Header({children}) {

    // const [index, setIndex] = useState(-1)

    // useEffect(() => {
    //     getReset(() => () => setIndex(-1))
    // }, [])

    // function onMouseDown({target}) {
    //     let nodeIndex = target.dataset.index;
    //     setIndex(nodeIndex == index ? -1 : nodeIndex);
    //     onNodeSelect && onNodeSelect(nodeIndex == index ? null : arrNode[target.dataset.index])
    // }

    return <div className="header">{children}</div>
}