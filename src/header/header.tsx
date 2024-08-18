import "./style.css"
import React from "react";
import {Button} from "../auxiliary/button/button";


export type TEventHeader = {
    name: 'undo' | 'redo' | 'copy' | 'past' | 'cut' | 'delete' | 'property',
    data?: any
};

export function Header({children, onEvent}) {

    function eventEmit(name: string) {
        onEvent && onEvent({name} as TEventHeader)
    }

    return <div className="header">
        <Button onClick={() => eventEmit('undo')} hint="Отмена ctrl+z">
            <div className="icon-undo"/>
        </Button>
        <Button onClick={() => eventEmit('redo')} hint="Повторить ctrl+y">
            <div className="icon-redo"/>
        </Button>
        <Button onClick={() => eventEmit('copy')} hint="Копировать ctrl+c">
            <div className="icon-copy"/>
        </Button>
        <Button onClick={() => eventEmit('past')} hint="Вставить ctrl+v">
            <div className="icon-past"/>
        </Button>
        <Button onClick={() => eventEmit('cut')} hint="Вырезать ctrl+x">
            <div className="icon-cut"/>
        </Button>
        <Button onClick={() => eventEmit('delete')} hint="Удалить delete">
            <div className="icon-delete"/>
        </Button>
        <Button onClick={() => eventEmit('property')} hint="Свойства">
            <div className="icon-property"/>
        </Button>
        <Button onClick={() => eventEmit('calc')} hint="Свойства">
            Calc
        </Button>
        <Button onClick={() => eventEmit('save')} hint="Сохранить">
            Save
        </Button>
        <Button onClick={() => eventEmit('read')} hint="Сохранить">
            Read
        </Button>
    </div>
}