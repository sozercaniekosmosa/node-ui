import "./style.css"
import React, {createElement, InputHTMLAttributes, useEffect, useRef, useState} from "react";
import {listNode} from "../nodes/nodes";
import {Button} from "../auxiliary/button/button";

export function Property({setNode, controlShow, onChange}) {

    let nodeName: string = ''
    let arrCfg: [[string, string, any, string]] = [];

    let refMenu = useRef(null);

    const show = (isShow) => refMenu.current.classList[isShow ? 'remove' : 'add']('property--hide')

    useEffect(() => {
        controlShow && controlShow(() => () => show(true))
    }, [])

    if (setNode) {
        nodeName = setNode.dataset.node;
        if (setNode.dataset?.cfg) {
            arrCfg = JSON.parse(base64to(setNode.dataset.cfg));
        }
        console.log(arrCfg, nodeName)
    }

    const listTypeComponent = {
        'number': function ({name, val, desc, onChange}) {
            return <div className="property__param">
                <div className="property__param__name">{desc}:</div>
                <input className="property__param__number" type="number" defaultValue={val}
                       onBlur={({target}) => onChange(name, target.value)}
                       onKeyDown={({target, key}) => {
                           if (key == 'Enter') onChange(name, (target as InputHTMLAttributes<string>).value)
                       }}/></div>
        }
    }

    const onChangeParam = (name, val) => {
        arrCfg = arrCfg.map((it) => (it[0] == name) ? [name, it[1], val, it[3]] : it)
        setNode.dataset.cfg = toBase64(JSON.stringify(arrCfg));
        console.log(arrCfg)
        console.log(setNode.dataset.cfg)
    }

    let onApply = () => {
        setNode.dataset.cfg = toBase64(JSON.stringify(arrCfg));
        onChange(setNode, arrCfg)
        show(false)
    };
    let onCancel = () => {
        show(false)
    }

    return (
        <div className="property property--hide" ref={refMenu}>
            <div className="property__header">
                <div>Конфигуратор</div>
                <Button onClick={onCancel}>
                    <div className="icon-cross"></div>
                </Button>
            </div>
            <div className="property__body">
                <div className="property__node-name">{nodeName}</div>
                {arrCfg.map(([name, type, val, desc], i) => {
                    let comp = listTypeComponent[type] ? listTypeComponent[type] : listNode[nodeName].components[type];
                    return createElement(comp, {name, val, desc, key: i, onChange: onChangeParam});
                })}
            </div>
            <div className="property__footer">
                <Button onClick={onApply}>Применить</Button>
                <Button onClick={onCancel}>Отмена</Button>
            </div>
        </div>)
}

export const toBase64 = (value: string) => window.btoa(decodeURIComponent((encodeURIComponent(value))));
export const base64to = (value: string) => window.atob(value);