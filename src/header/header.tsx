import "./style.css"
import React from "react";
import {Button} from "../auxiliary/button/button";


export type TEventHeader = {
    name: 'undo' | 'redo' | 'copy' | 'past' | 'cut' | 'delete' | 'property' | 'save' | 'start' | 'stop',
    data?: any
};

export function Header({children, onEvent}) {

    function eventEmit(name: string) {
        onEvent && onEvent({name} as TEventHeader)
    }

    return <div className="header">
        <button onClick={() => eventEmit('save')} hint="Сохранить">
            <div className="icon-save"/>
        </button>
        <button onClick={() => eventEmit('undo')} hint="Отмена ctrl+z">
            <div className="icon-undo"/>
        </button>
        <button onClick={() => eventEmit('redo')} hint="Повторить ctrl+y">
            <div className="icon-redo"/>
        </button>
        <button onClick={() => eventEmit('copy')} hint="Копировать ctrl+c">
            <div className="icon-copy"/>
        </button>
        <button onClick={() => eventEmit('past')} hint="Вставить ctrl+v">
            <div className="icon-past"/>
        </button>
        <button onClick={() => eventEmit('cut')} hint="Вырезать ctrl+x">
            <div className="icon-cut"/>
        </button>
        <button onClick={() => eventEmit('delete')} hint="Удалить delete">
            <div className="icon-delete"/>
        </button>
        <button onClick={() => eventEmit('property')} hint="Свойства">
            <div className="icon-property"/>
        </button>
        <button onClick={() => eventEmit('start')} hint="Запустить систему">
            <div className="icon-play"/>
        </button>
        <button onClick={() => eventEmit('stop')} hint="Остановить систему">
            <div className="icon-stop"/>
        </button>
    </div>
}