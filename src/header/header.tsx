import "./style.css"
import React from "react";
import {Button} from "../auxiliary/button/button";


export type TEventHeader = {
    name: 'undo' | 'redo' | 'copy' | 'past' | 'cut' | 'delete' | 'property' | 'save' | 'start' | 'stop'
        | 'module',
    data?: any
};

export function Header({children, onEvent}) {

    function eventEmit(name: string) {
        onEvent && onEvent({name} as TEventHeader)
    }

    return <div className="header">
        <button onClick={() => eventEmit('save')} title="Сохранить">
            <div className="icon-save"/>
        </button>
        <button onClick={() => eventEmit('undo')} title="Отмена ctrl+z">
            <div className="icon-undo"/>
        </button>
        <button onClick={() => eventEmit('redo')} title="Повторить ctrl+y">
            <div className="icon-redo"/>
        </button>
        <button onClick={() => eventEmit('copy')} title="Копировать ctrl+c">
            <div className="icon-copy"/>
        </button>
        <button onClick={() => eventEmit('past')} title="Вставить ctrl+v">
            <div className="icon-past"/>
        </button>
        <button onClick={() => eventEmit('cut')} title="Вырезать ctrl+x">
            <div className="icon-cut"/>
        </button>
        <button onClick={() => eventEmit('delete')} title="Удалить delete">
            <div className="icon-delete"/>
        </button>
        <button onClick={() => eventEmit('property')} title="Свойства">
            <div className="icon-property"/>
        </button>
        <button onClick={() => eventEmit('start')} title="Запустить систему">
            <div className="icon-play"/>
        </button>
        <button onClick={() => eventEmit('stop')} title="Остановить систему">
            <div className="icon-stop"/>
        </button>
        <button onClick={() => eventEmit('module')} title="Остановить систему">
            mod
        </button>
    </div>
}