import "./style.css"
import React, {useEffect, useState} from "react";
import {arrNode} from "../nodes";

export function Toolbox({onNodeSelect, reset}) {

    const [index, setIndex] = useState(-1)

    // reset(() => {
    //     setIndex(-1);
    // })

    useEffect(()=>{
        reset(() => {
            setIndex(-1);
        })
    },[])

    function onMouseDown({target}) {
        let nodeIndex = target.dataset.index;
        setIndex(nodeIndex == index ? -1 : nodeIndex);
        onNodeSelect && onNodeSelect(nodeIndex == index ? null : arrNode[target.dataset.index])
    }

    return (
        <div className="tool" onMouseDown={onMouseDown}>
            {arrNode.map((it, i) => {
                return (
                    <div className={'tool__item' + (i == index ? ' tool__item--press' : '')} key={i} data-index={i}>
                        <div className="tool__icon" style={{backgroundImage: it.icon}}></div>
                        <div className="tool__desc">{it.name}</div>
                    </div>
                )
            })}
        </div>
    )
}

export const toBase64 = (value: string) => window.btoa(decodeURIComponent((encodeURIComponent(value))));
export const base64to = (value: string) => window.atob(value);