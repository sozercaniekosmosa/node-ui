import {Button} from "../button/button";
import React, {useEffect, useRef, useState} from "react";
import "./style.css"
import {eventBus} from "../../utils"

export function MenuConfirm({children, onClickYes, onClickNo, show = 'confirm-show', hide = "confirm-hide"}) {
    let refMenu = useRef(null);
    let refCallback = useRef((is) => is);
    let [desc, setDesc] = useState('Введите сообщение');

    const showMenu = (isShow) => {
        refMenu.current.classList[isShow ? 'remove' : 'add']('menu-confirm--hide')
        refMenu.current.focus()
    }

    function onKeyDown(e) {
        const key = e.code.toLowerCase();
        if (key == 'enter') {
            onClickYes && onClickYes();
            refCallback.current(true)
            showMenu(false);
        }
        if (key == 'escape') {
            onClickNo && onClickNo();
            refCallback.current(false)
            showMenu(false);
        }
    }

    eventBus && eventBus.addEventListener(show, (callback, description) => {
        setDesc(description ? description : children)
        refCallback.current = callback;
        showMenu(true)
    })
    eventBus && eventBus.addEventListener(hide, () => showMenu(false))

    const onCancel = () => {
        onClickNo && onClickNo();
        refCallback.current(false)
        showMenu(false);
    }

    return (
        <div className="menu-back menu-confirm--hide" ref={refMenu} onKeyDown={onKeyDown} onClick={onCancel} tabIndex="-1">
            <div className="menu-confirm center">
                <div>{desc}</div>
                <div className="menu-confirm__buttons">
                    <Button onClick={() => {
                        onClickYes && onClickYes();
                        refCallback.current(true)
                        showMenu(false);
                    }}>Да</Button>
                    <Button onClick={onCancel}>Нет</Button>
                </div>
            </div>
        </div>);
}