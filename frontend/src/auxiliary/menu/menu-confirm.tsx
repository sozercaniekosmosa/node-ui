import React, {useEffect, useRef, useState} from "react";
import "./style.css"
import {eventBus} from "../../utils"

interface IMenuConfirmProps {
    name?: string;
    onClickYes?: () => void;
    onClickNo?: () => void;
    children?: any;
}

export const MenuConfirm: React.FC<IMenuConfirmProps> = (
    {children = null, onClickYes, onClickNo, name = 'confirm-show'}) => {

    let refMenu = useRef(null);
    let refSelBtn = useRef(null);
    let refOk = useRef(null);
    let refCancel = useRef(null);
    let refCallback = useRef((is) => is);
    let [desc, setDesc] = useState('Введите сообщение');

    const showMenu = (isShow) => {
        refSelBtn.current = refOk.current;
        refMenu.current.classList[isShow ? 'remove' : 'add']('menu-confirm--hide')
        refMenu.current.focus()

        refOk.current.classList.add('menu-confirm__buttons--focus')
        refCancel.current.classList.remove('menu-confirm__buttons--focus')

    }

    function onOk() {
        onClickYes && onClickYes();
        refCallback.current(true)
        showMenu(false);
    }

    function onCancel() {
        onClickNo && onClickNo();
        refCallback.current(false)
        showMenu(false);
    }

    function onKeyDown(e) {
        const key = e.code.toLowerCase();
        if (key == 'enter' || key == 'numpadenter') {
            if (refSelBtn.current == refOk.current) onOk(); else onCancel();
        }
        if (key == 'escape') onCancel();
        if (key == 'arrowright') {
            refOk.current.classList.remove('menu-confirm__buttons--focus')
            refCancel.current.classList.add('menu-confirm__buttons--focus')
            refSelBtn.current = refCancel.current;
        }
        if (key == 'arrowleft') {
            refCancel.current.classList.remove('menu-confirm__buttons--focus')
            refOk.current.classList.add('menu-confirm__buttons--focus')
            refSelBtn.current = refOk.current;
        }
    }

    eventBus && eventBus.addEventListener(name, (callback, description) => {
        setDesc(description ? description : children)
        refCallback.current = callback;
        showMenu(true)
    })

    return (
        <div className="menu-back menu-confirm--hide" ref={refMenu} onKeyDown={onKeyDown} onClick={onCancel}
             tabIndex={-1}>
            <div className="menu-confirm center">
                <div>{desc}</div>
                <div className="menu-confirm__buttons">
                    <button onClick={onOk} ref={refOk} tabIndex={-1}>Да</button>
                    <button onClick={onCancel} ref={refCancel} tabIndex={-1}>Нет</button>
                </div>
            </div>
        </div>);
};