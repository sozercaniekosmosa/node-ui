import "./style.css"
import React, {createElement, InputHTMLAttributes, useRef, useState} from "react";
import {camelToKebab, compressString, decompressString, eventBus} from '../utils'


export type TEventProperty = {
    name: 'property-change',
    data?: any
}

let arrKey = {};

export function Property({setNode, onChange}) {

    const [, setUpdateNow] = useState(0); //для перерисовки компонента
    let nodeName: string = '';

    let refChanged = useRef(null); //флаг -- компонент изменен
    let refArrCfg = useRef([]);
    let refIsWasChange = useRef(false);

    let refProp = useRef(null);
    let refPropTabs = useRef(null);

    const show = (isShow) => {
        arrKey = {};
        setUpdateNow(conut => conut + 1); //при каждом показе/скрытиии перерисовываем}
        refProp.current.classList[isShow ? 'remove' : 'add']('prop--hide');
        refProp.current.focus();
        refChanged.current.innerHTML = '';
    }

    if (setNode) {
        nodeName = setNode.dataset.nodeName;
        refArrCfg.current = JSON.parse(decompressString(setNode.dataset.cfg)!);
    }

    eventBus.addEventListener('menu-property-show', () => {
        refIsWasChange.current = false;
        show(true)
    })

    const noType = (typeName) => () => <b style={{color: "#cc0000"}}>[{typeName}]</b>

    const listTypeComponent = {
        'number': function ({name, val, onChange}) {
            return <>
                <input className="prop__param__number" type="number" defaultValue={val}
                       onBlur={({target}) => onChange(name, Number(target.value), val)}
                       onKeyDown={({target, key}) => {
                           if (key == 'Enter') onChange(name, Number((target as InputHTMLAttributes<string>).value), val)
                       }}/></>
        },
        'string': function ({name, val, onChange}) {
            return <>
                <input className="prop__param__string" type="text" defaultValue={val}
                       onBlur={({target}) => onChange(name, target.value)}
                       onKeyDown={({target, key}) => {
                           if (key == 'Enter') onChange(name, (target as InputHTMLAttributes<string>).value)
                       }}/></>
        }
    }

    const onChangeParam = (name, val, _val) => {
        Object.entries(refArrCfg.current).forEach(([key, param]) => {
            param.forEach(({name: _name, type, val: _val, title}, i) => {
                if (_name == name && _val != val) {
                    refIsWasChange.current = true;
                    refArrCfg.current[key][i] = {name, type, val, title}
                    refChanged.current.innerHTML = '*';
                }
            })
        })
        // setNode.dataset.cfg = compressString(JSON.stringify(arrCfg));
        // console.log(refArrCfg.current)
        // console.log(setNode.dataset.cfg)
    }

    let onApply = () => {
        if (refIsWasChange.current) {
            setNode.dataset.cfg = compressString(JSON.stringify(refArrCfg.current));
            onChange({name: 'property-change', data: setNode})
        }
        show(false)
    };
    let onCancel = () => {
        if (refIsWasChange.current) {
            eventBus.dispatchEvent('confirm', (isYes) => {
                if (isYes) {
                    setNode.dataset.cfg = compressString(JSON.stringify(refArrCfg.current));
                    // onChange(setNode, refArrCfg.current)
                }
                show(false)
            }, 'Сохранить изменения?')
        } else {
            show(false)
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
        <div className="prop prop--hide" ref={refProp} tabIndex={-1}
             onKeyDown={onKeyDown}
             onKeyUp={onKeyUp}
             onClick={({target}) => (target as Element).classList.contains('prop') && onCancel()}>
            <div className="prop__menu">
                <div className="prop__header">
                    <div>
                        Конфигуратор: {nodeName}
                        <div ref={refChanged} style={{display: 'inline'}}></div>
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
                        return (
                            <div className="tab__body__item" key={iTab} style={iTab !== 0 ? {display: 'none'} : {}}>
                                {arrParam.map(({name, type, val, title, arrOption}, i) => {
                                    let comp = listTypeComponent[type] ? listTypeComponent[type] : noType(type);
                                    let arrStyle = [];
                                    if (arrOption) {
                                        let setCSS = new Set(['inline', 'center', 'right', 'left', '2', '3', 'hr'])
                                        arrOption.forEach(it => { //inline, center, right, left, 2, 3, hr
                                            if (setCSS.has(it)) arrStyle.push('prop__param--' + it)
                                        })
                                    }

                                    let props = {name, val, title, key: i, onChange: onChangeParam};
                                    return <div className={"prop__param " + arrStyle.join(' ')} key={i}>
                                        {title ? <div className="prop__param__name">{title + ':'}</div> : ''}
                                        {createElement(comp, props)}
                                    </div>
                                })}
                            </div>)

                    })}
                </div>

                <div className="prop__footer">
                    <button onClick={onApply}>Применить</button>
                    <button onClick={onCancel}>Отмена</button>
                </div>
            </div>
        </div>
    )
}

//@ts-ignore
// window.decompress = decompress, window.compress = compress;