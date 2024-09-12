import "./style.css"
import React, {createElement, useEffect, useRef, useState} from "react";
import {camelToKebab, compressString, decompressString, eventBus} from '../utils'
import Number from "./components/number/number"
import HostPort from "./components/host-port/host-port";
import String from "./components/string/string";
import CodeEditor from "./components/code-editor/code-editor";

export type TEventProperty = {
    name: 'property-change',
    data?: any
}

let arrKey = {};

export function Property({setNode, onEvent}) {

    let nodeName: string = '';
    let [statusColor, setStatusColor] = useState('#fff');
    const [show, setShow] = useState(false);
    useEffect(() => {
        show && refProp.current.focus();
        messageSocket(null, "node-status", setNode?.dataset.state);
    }, [show])

    let refHeader = useRef(null);
    let refArrCfg = useRef([]);
    let [isChanged, setIsChanged] = useState(false); //флаг -- компонент изменен

    let refProp = useRef(null);
    let refPropTabs = useRef(null);

    if (show && setNode) {
        nodeName = setNode.dataset.nodeName;
        refArrCfg.current = JSON.parse(decompressString(setNode.dataset.cfg)!);
        // console.log(refArrCfg.current)
    }

    eventBus.addEventListener('menu-property-show', () => {
        setIsChanged(false);
        arrKey = {};
        setShow(true)
    })

    function messageSocket(id, type, state) {

        switch (type) {
            case "log":
                break;
            case "node-status":
                let fill = '#dcdcdc';
                if (state) {
                    (state === 'run') && (fill = '#b6ffc8');
                    (state === 'error') && (fill = '#ff5967');
                    (state === 'stop') && (fill = '#dcdcdc');
                }
                setStatusColor(fill);
                break;
        }
    }


    eventBus.addEventListener('message-socket', ({type, data: {id, state}}) =>
        (setNode && setNode.id == id) && messageSocket(id, type, state));

    const noType = (typeName) => () => <b style={{color: "#cc0000"}}>[{typeName}]</b>

    const listTypeComponent = {
        'number': Number,
        'string': String,
        'host-port': HostPort,
        'code-editor': CodeEditor,
    }

    const onChangeParam = (name, val) => {

        Object.entries(refArrCfg.current).forEach(([tabName, arrParam]) => {
            arrParam.forEach(({name: _name, type, val: _val, title, arrOption}, i) => {
                if (_name == name) {
                    let isChanged: boolean = typeof val == 'object' ? JSON.stringify(val) != JSON.stringify(_val) : val != _val;
                    if (isChanged) {
                        setIsChanged(true);
                        refArrCfg.current[tabName][i] = {name, type, val, title, arrOption}
                    }
                }
            })
        })
    }

    let onApply = () => {
        if (isChanged) {
            // console.log('apply')
            setNode.dataset.cfg = compressString(JSON.stringify(refArrCfg.current));
            onEvent({name: 'property-change', data: setNode})
        }
        setShow(false)
    };
    let onCancel = () => {
        if (isChanged) {
            eventBus.dispatchEvent('confirm', (isYes) => {
                if (isYes) {
                    setNode.dataset.cfg = compressString(JSON.stringify(refArrCfg.current));
                    onEvent({name: 'property-change', data: setNode})
                }
                setShow(false)
            }, 'Сохранить изменения?')
        } else {
            setShow(false)
        }
    }

    function onClickTab(e) {

        if (!e.target.classList.contains('tab__header__item')) return;
        e.target.parentNode.querySelector('.tab__header__item--active')?.classList.remove('tab__header__item--active')
        e.target.classList.add('tab__header__item--active')

        const index = e.target.dataset.index;
        [...refPropTabs.current.children].forEach(node => node.style.display = 'none')
        refPropTabs.current.children[index].style.display = ''
    }

    const onKeyUp = (e) => arrKey[camelToKebab(e.code).toLowerCase()] = false
    const onKeyDown = (e) => {
        const code = camelToKebab(e.code).toLowerCase();
        if (arrKey[code]) return;
        arrKey[code] = true;

        if (arrKey?.['escape']) {
            arrKey = {};
            onCancel();
        }

        if (arrKey?.['control-left'] && (arrKey?.['enter'] || arrKey?.['numpad-enter'])) onApply()
        // console.log(e.code.toLowerCase())
    }


    return (
        show ? <div className="prop" ref={refProp} tabIndex={-1} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
                    onClick={({target}) => (target as Element).classList.contains('prop') && onCancel()}>
            <div className="prop__menu">
                <div className="prop__header" ref={refHeader} style={{backgroundColor: statusColor}}>
                    <div>
                        Конфигуратор: {nodeName}
                        <div style={{display: 'inline'}}>{isChanged ? '*' : ''}</div>
                    </div>
                    <button onClick={onCancel}>
                        <div className="icon-cross" style={{width: '16px', height: '16px'}}></div>
                    </button>
                </div>

                <div className="tab__header" onClick={onClickTab}>
                    {Object.entries(refArrCfg.current).map(([tabName, arrParam], iTab) => {
                        return <div
                            className={"tab__header__item " + (iTab == 0 ? 'tab__header__item--active' : '')}
                            key={iTab}
                            data-index={iTab}>{tabName}</div>
                    })}
                </div>
                <div className="tab__body" ref={refPropTabs}>
                    {Object.entries(refArrCfg.current).map(([tabName, arrParam], iTab) => {
                        const isTab = arrParam?.[0]?.arrOption?.[0] == 'tab';
                        return (
                            <div className={"tab__body__item" + (isTab ? " tab__body__item--contents" : "")} key={iTab}
                                 style={iTab !== 0 ? {display: 'none'} : {}}>
                                {arrParam.map(({name, type, val, title, arrOption}, i) => {
                                    let comp = listTypeComponent[type] ? listTypeComponent[type] : noType(type);
                                    let arrStyle = [];
                                    if (arrOption) {
                                        let setCSS = new Set(['center', 'right', 'left', '1', '2', '3', 'hr', 'tab'])
                                        arrOption.forEach(it => { //inline, center, right, left, 2, 3, hr
                                            if (setCSS.has(it)) arrStyle.push('prop__param--' + it)
                                        })
                                    }

                                    let props = {name, val, title, key: i, onChange: onChangeParam, node: setNode};
                                    let res: React.ReactElement;
                                    if (isTab) {
                                        res = createElement(comp, props);
                                    } else {
                                        res = <div className={"prop__param " + arrStyle.join(' ')} key={i}>
                                            {title ? <div className="prop__param__name">{title + ':'}</div> : ''}
                                            {createElement(comp, props)}
                                        </div>;
                                    }
                                    return res
                                })}
                            </div>)

                    })}
                </div>

                <div className="prop__footer">
                    <button onClick={onApply}>Применить</button>
                    <button onClick={onCancel}>Отмена</button>
                </div>
            </div>
        </div> : ''
    )
}

//@ts-ignore
// window.decompress = decompress, window.compress = compress;