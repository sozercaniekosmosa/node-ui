import {Button} from "../button/button";
import React, {useEffect, useRef, useState} from "react";
import "./style.css"

export function MenuConfirm({children, onClickYes, onClickNo, controlShow}) {
    let refMenu = useRef(null);

    const show = (isShow) => refMenu.current.classList[isShow ? 'remove' : 'add']('menu-confirm--hide')

    useEffect(() => {
        controlShow && controlShow(() => () => show(true))
    }, [])

    return (
        <div className="menu-confirm center menu-confirm--hide" ref={refMenu}>
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