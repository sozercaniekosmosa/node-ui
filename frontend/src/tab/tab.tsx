import "./style.css"
import React, {useEffect, useRef} from "react";
import {eventBus} from '../utils'
import {TMessage} from "../../../general/types";


let mess: ({type, data}: TMessage) => void;
eventBus.addEventListener('message-socket', param => mess && mess(param));

export function Tab({arrTab}) {

    let refPropTabs = useRef(null);

    const onClickTab = e => {
        if (!e.target.classList.contains('tab__header__item')) return;
        e.target.parentNode.querySelector('.tab__header__item--active')?.classList.remove('tab__header__item--active')
        e.target.classList.add('tab__header__item--active')

        const index = e.target.dataset.index;
        [...refPropTabs.current.children].forEach(node => node.style.display = 'none')
        refPropTabs.current.children[index].style.display = ''
    };

    return (
        <>
            <div className="tab__header" onClick={onClickTab}>
                {arrTab.map(([tabName, content], iTab) => {
                    return <div
                        className={"tab__header__item " + (iTab == 0 ? 'tab__header__item--active' : '')}
                        key={iTab}
                        data-index={iTab}>{tabName}</div>
                })}
            </div>
            <div className="tab__body" ref={refPropTabs}>
                {arrTab.map(([tabName, content, strClass], iTab) => {
                    return (
                        <div className={"tab__body__item " + strClass} key={iTab}
                             style={iTab !== 0 ? {display: 'none'} : {}}>
                            {content}
                        </div>)

                })}
            </div>
        </>
    )
}

//@ts-ignore
// window.decompress = decompress, window.compress = compress;