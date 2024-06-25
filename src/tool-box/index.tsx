import "./style.css"
import React, {useEffect, useState} from "react";
import value from "../nodes/value";
import sum from "../nodes/sum"

// this.style.backgroundImage = iconBase64

export function Toolbox({onChosenNode}) {
    let arr = [new value(), new sum()]

    function onMouseDown({target}) {
        if (!target.classList.contains('tool__item')) return;
        target.parentNode.querySelectorAll('.tool__item').forEach(node => node != target && node.classList.remove('tool__item--press'))
        target.classList.toggle('tool__item--press')
        if (onChosenNode) {
            const node = target.parentNode.parentNode.querySelector('.tool__item--press')
            onChosenNode(arr[node.dataset.index])
        }
    }

    return (
        <div className="tool" onMouseDown={onMouseDown}>
            {arr.map((it, i) => {
                return (
                    <div className="tool__item" key={i} data-index={i}>
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