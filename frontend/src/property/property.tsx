import "./style.css"
import React, {createElement, useEffect, useRef, useState} from "react";
import {camelToKebab, compressString, decompressString, eventBus} from '../utils'
import Number from "./components/number/number"
import HostPort from "./components/host-port/host-port";
import String from "./components/string/string";
import CodeEditor from "./components/code-editor/code-editor";
import {TChangeProps, TMessage} from "../../../general/types";
import TaskControl from "./components/task-control/task-control";
import Checkbox from "./components/checkbox/checkbox";
import {Tab} from "../tab/tab";

export type TEventProperty = {
    name: 'property-change' | 'property-open' | 'property-close',
    data?: any
}
let arrKey = {};
let nodeName: string = '';
let nodeID: string = '';

const noType = (typeName) => () => <b style={{color: "#cc0000"}}>[{typeName}]</b>
const listTypeComponent = {
    'number': Number,
    'string': String,
    'host-port': HostPort,
    'code-editor': CodeEditor,
    'task-control': TaskControl,
    'checkbox': Checkbox,
}


let mess: ({type, data}: TMessage) => void;
eventBus.addEventListener('message-socket', param => mess && mess(param));

export function Property({node, onEvent}) {

    let [statusColor, setStatusColor] = useState('#fff');
    let [isChanged, setIsChanged] = useState(false); //флаг -- компонент изменен
    let [arrCfg, setArrCfg] = useState([]);

    let refHeader = useRef(null);
    let refProp = useRef(null);
    let refPropTabs = useRef(null);

    useEffect(() => {
        nodeName = node.dataset.nodeName;
        setStatus(node.dataset.state);
        setArrCfg(JSON.parse(decompressString(node.dataset.cfg)!));
        refProp?.current && refProp?.current.focus();

        mess = ({type, data}: TMessage) => {
            switch (type) {
                case "log":
                    break;
                case "server-init":
                    setStatus('stop');
                    break;
                case "node-status":
                    if (!node && data || node.id != data?.id) break;
                    setStatus(data.state);
                    break;
            }
        };

    }, [])

    function setStatus(state: string) {
        let fill = '#dcdcdc';
        if (state) {
            (state === 'run') && (fill = '#b6ffc8');
            (state === 'error') && (fill = '#ff5967');
            (state === 'stop') && (fill = '#dcdcdc');
        }
        setStatusColor(fill);
    }

    const onChangeParam = (name, val) => {
        Object.entries(arrCfg).forEach(([tabName, arrParam]) => {
            arrParam.forEach(({name: _name, type, val: _val, title, arrOption}, i) => {
                if (_name == name) {
                    let isChanged: boolean = typeof val == 'object' ? JSON.stringify(val) != JSON.stringify(_val) : val != _val;
                    if (isChanged) {
                        setIsChanged(true);
                        arrCfg[tabName][i] = {name, type, val, title, arrOption}
                    }
                }
            })
        })
    }

    let onApply = (isClose = true) => {
        if (isChanged) {
            // console.log('apply')
            node.dataset.cfg = compressString(JSON.stringify(arrCfg));
            onEvent({name: 'property-change', data: node})
            setIsChanged(false);
        }
        if (isClose) onEvent({name: 'property-close'})
    };
    let onCancel = () => {
        if (isChanged) {
            eventBus.dispatchEvent('confirm', (isYes) => {
                if (isYes) {
                    node.dataset.cfg = compressString(JSON.stringify(arrCfg));
                    onEvent({name: 'property-change', data: node})
                }
                onEvent({name: 'property-close'})
            }, 'Сохранить изменения?')
        } else {
            onEvent({name: 'property-close'})
        }
    }

    const onClickTab = e => {
        if (!e.target.classList.contains('tab__header__item')) return;
        e.target.parentNode.querySelector('.tab__header__item--active')?.classList.remove('tab__header__item--active')
        e.target.classList.add('tab__header__item--active')

        const index = e.target.dataset.index;
        [...refPropTabs.current.children].forEach(node => node.style.display = 'none')
        refPropTabs.current.children[index].style.display = ''
    };

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
        if (arrKey?.['control-left'] && arrKey?.['key-s']) {
            onApply(false);
            e.preventDefault();
        }
        // console.log(e.code.toLowerCase())
    }


    const arrTab = Object.entries(arrCfg).map(([tabName, arrParam], iTab) => {
        const isTab = arrParam?.[0]?.arrOption?.[0] == 'tab';
        return [tabName, arrParam.map(({name, type, val, title, arrOption}, i) => {
            let comp = listTypeComponent[type] ? listTypeComponent[type] : noType(type);
            let arrStyle = [];
            if (arrOption) {
                let setCSS = new Set(['center', 'right', 'left', '1', '2', '3', 'hr', 'tab'])
                arrOption.forEach(it => setCSS.has(it) && arrStyle.push('prop__param--' + it))
            }

            let props: TChangeProps = {name, val, title, key: i, onChange: onChangeParam, node};
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
        }), isTab ? 'tab__body__item--contents' : '']
    });


    return (
        <div className="prop" ref={refProp} tabIndex={-1} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
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

                <Tab arrTab={arrTab}/>

                <div className="prop__footer">
                    <button onClick={() => onApply()}>Применить</button>
                    <button onClick={onCancel}>Отмена</button>
                    <button onClick={() => onApply(false)}>Сохранить</button>
                </div>
            </div>
        </div>

    )

    // return (
    //     <div className="prop" ref={refProp} tabIndex={-1} onKeyDown={onKeyDown} onKeyUp={onKeyUp}
    //          onClick={({target}) => (target as Element).classList.contains('prop') && onCancel()}>
    //         <div className="prop__menu">
    //             <div className="prop__header" ref={refHeader} style={{backgroundColor: statusColor}}>
    //                 <div>
    //                     Конфигуратор: {nodeName}
    //                     <div style={{display: 'inline'}}>{isChanged ? '*' : ''}</div>
    //                 </div>
    //                 <button onClick={onCancel}>
    //                     <div className="icon-cross" style={{width: '16px', height: '16px'}}></div>
    //                 </button>
    //             </div>
    //             <div className="tab__header" onClick={onClickTab}>
    //                 {Object.entries(arrCfg).map(([tabName, arrParam], iTab) => {
    //                     return <div
    //                         className={"tab__header__item " + (iTab == 0 ? 'tab__header__item--active' : '')}
    //                         key={iTab}
    //                         data-index={iTab}>{tabName}</div>
    //                 })}
    //             </div>
    //             <div className="tab__body" ref={refPropTabs}>
    //                 {Object.entries(arrCfg).map(([tabName, arrParam], iTab) => {
    //                     const isTab = arrParam?.[0]?.arrOption?.[0] == 'tab';
    //                     return (
    //                         <div className={"tab__body__item" + (isTab ? " tab__body__item--contents" : "")} key={iTab}
    //                              style={iTab !== 0 ? {display: 'none'} : {}}>
    //                             {arrParam.map(({name, type, val, title, arrOption}, i) => {
    //                                 let comp = listTypeComponent[type] ? listTypeComponent[type] : noType(type);
    //                                 let arrStyle = [];
    //                                 if (arrOption) {
    //                                     let setCSS = new Set(['center', 'right', 'left', '1', '2', '3', 'hr', 'tab'])
    //                                     arrOption.forEach(it => setCSS.has(it) && arrStyle.push('prop__param--' + it))
    //                                 }
    //
    //                                 let props: TChangeProps = {name, val, title, key: i, onChange: onChangeParam, node};
    //                                 let res: React.ReactElement;
    //                                 if (isTab) {
    //                                     res = createElement(comp, props);
    //                                 } else {
    //                                     res = <div className={"prop__param " + arrStyle.join(' ')} key={i}>
    //                                         {title ? <div className="prop__param__name">{title + ':'}</div> : ''}
    //                                         {createElement(comp, props)}
    //                                     </div>;
    //                                 }
    //                                 return res
    //                             })}
    //                         </div>)
    //
    //                 })}
    //             </div>
    //
    //             <div className="prop__footer">
    //                 <button onClick={() => onApply()}>Применить</button>
    //                 <button onClick={onCancel}>Отмена</button>
    //                 <button onClick={() => onApply(false)}>Сохранить</button>
    //             </div>
    //         </div>
    //     </div>
    //
    // )
}

//@ts-ignore
// window.decompress = decompress, window.compress = compress;