import {Button} from "../button/button";
import React, {useEffect, useRef, useState} from "react";
import "./style.css"

export function MenuConfirm({children, onClickYes, onClickNo, controlShow}) {
    let refMenu = useRef(null);

    const show = (isShow) => {
        refMenu.current.classList[isShow ? 'remove' : 'add']('menu-confirm--hide')
        refMenu.current.focus()
    }

    useEffect(() => {
        controlShow && controlShow(() => () => show(true));
    }, [])

    function onKeyDown(e) {
        const key = e.code.toLowerCase();
        if (key == 'enter') {
            onClickYes && onClickYes();
            show(false);
        }
        if (key == 'escape') {
            onClickNo && onClickNo();
            show(false);
        }
    }

    return (
        <div className="menu-confirm center menu-confirm--hide" ref={refMenu} onKeyDown={onKeyDown} tabIndex="-1">
            <div>{children}</div>
            <div className="menu-confirm__buttons">
                <Button onClick={() => {
                    onClickYes && onClickYes();
                    show(false);
                }}>Да</Button>
                <Button onClick={() => {
                    onClickNo && onClickNo();
                    show(false);
                }}>Нет</Button>
            </div>
        </div>);
}