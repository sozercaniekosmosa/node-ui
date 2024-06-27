import "./style.css"
import React, {createElement, useEffect, useState} from "react";
import {listNode} from "../nodes/nodes";

export function Property({setNode}) {

    const [arr, setArr] = useState(['Item 1', 'Item 2', 'Item 3']);

    let nodeName: string = ''
    let arrCfg: [[string, string, any]] = [];
    if (setNode) {
        nodeName = setNode.dataset.node;
        if (setNode.dataset?.cfg) {
            arrCfg = JSON.parse(base64to(setNode.dataset.cfg));
        }
        console.log(arrCfg, nodeName)
    }

    const listTypeComponent = {
        'number': function ({name, val}) {
            return <div>{name}: <input value={val} onChange={() => true}/></div>
        }
    }

    return (
        <div className="property">
            <div className="property__header">
                <div>Конфигуратор{nodeName}</div>
                <div className="property__button icon-cross"></div>
            </div>
            <div className="property__body">
                {arrCfg.map(([name, type, val], i) => {
                    let comp = listTypeComponent[type] ? listTypeComponent[type] : listNode[nodeName].components[type];
                    return createElement(comp, {name, val, key: i})
                })}
            </div>
            <div className="property__footer"></div>
        </div>)
}

export const toBase64 = (value: string) => window.btoa(decodeURIComponent((encodeURIComponent(value))));
export const base64to = (value: string) => window.atob(value);