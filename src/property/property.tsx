import "./style.css"
import React, {createElement, InputHTMLAttributes, useEffect, useRef, useState} from "react";
import {listNode} from "../nodes/nodes";
import {Button} from "../auxiliary/button/button";

export function Property({setNode, controlShow, onChange}) {

    let nodeName: string = ''
    // let arrCfg: [[string, string, any, string]] = [];
    let arrCfg = useRef([]);

    let refProp = useRef(null);
    let refPropTabs = useRef(null);

    const show = (isShow) => refProp.current.classList[isShow ? 'remove' : 'add']('property--hide')

    useEffect(() => {
        controlShow && controlShow(() => () => show(true))
    }, [])

    if (setNode) {
        nodeName = setNode.dataset.node;
        arrCfg.current = JSON.parse(base64to(setNode.dataset.cfg));
    }

    const listTypeComponent = {
        'number': function ({name, val, title, onChange}) {
            return <div className="property__param">
                <div className="property__param__name">{title}:</div>
                <input className="property__param__number" type="number" defaultValue={val}
                       onBlur={({target}) => onChange(name, target.value)}
                       onKeyDown={({target, key}) => {
                           if (key == 'Enter') onChange(name, (target as InputHTMLAttributes<string>).value)
                       }}/></div>
        },
        'string': function ({name, val, title, onChange}) {
            return <div className="property__param">
                <div className="property__param__name">{title}:</div>
                <input className="property__param__string" type="text" defaultValue={val}
                       onBlur={({target}) => onChange(name, target.value)}
                       onKeyDown={({target, key}) => {
                           if (key == 'Enter') onChange(name, (target as InputHTMLAttributes<string>).value)
                       }}/></div>
        }
    }

    const onChangeParam = (name, val) => {
        Object.entries(arrCfg.current).forEach(([key, param]) => {
            param.forEach(({name: _name, type, val: _val, title}, i) => {
                if (_name == name) {
                    arrCfg.current[key][i] = {name, type, val, title}
                }
            })
        })
        // setNode.dataset.cfg = toBase64(JSON.stringify(arrCfg));
        console.log(arrCfg.current)
        console.log(setNode.dataset.cfg)
    }

    let onApply = () => {
        setNode.dataset.cfg = toBase64(JSON.stringify(arrCfg.current));
        onChange(setNode, arrCfg.current)
        show(false)
    };
    let onCancel = () => {
        show(false)
    }

    function onClickTab(e) {

        e.target.parentNode.querySelector('.tab__header__item--active')?.classList.remove('tab__header__item--active')
        e.target.classList.add('tab__header__item--active')

        const index = e.target.dataset.index;
        [...refPropTabs.current.children].forEach(node => node.style.display = 'none')
        refPropTabs.current.children[index].style.display = ''
    }


    return (
        <div className="property property--hide" ref={refProp}>
            <div className="property__menu">
                <div className="property__header">
                    <div>Конфигуратор: {nodeName}</div>
                    <Button onClick={onCancel}>
                        <div className="icon-cross"></div>
                    </Button>
                </div>

                <div className="tab__header" onClick={onClickTab}>
                    {Object.entries(arrCfg.current).map(([tabName, arrParam], iTab) => {
                        return <div
                            className={"tab__header__item " + (iTab == 0 ? 'tab__header__item--active' : '')}
                            key={iTab}
                            data-index={iTab}>{tabName}</div>
                    })}
                </div>
                <div className="tab__body" ref={refPropTabs}>
                    {Object.entries(arrCfg.current).map(([tabName, arrParam], iTab) => {
                        return (<div className="tab__body__item" key={iTab}
                                     style={{display: iTab == 0 ? 'unset' : 'none'}}>
                            {arrParam.map(({name, type, val, title}, i) => {
                                let comp = listTypeComponent[type] ? listTypeComponent[type] : listNode[nodeName].components[type];
                                return createElement(comp, {
                                    name,
                                    val,
                                    title,
                                    key: i,
                                    onChange: onChangeParam
                                })
                            })}
                        </div>)

                    })}
                </div>

                <div className="property__footer">
                    <Button onClick={onApply}>Применить</Button>
                    <Button onClick={onCancel}>Отмена</Button>
                </div>
            </div>
        </div>
    )
}

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));