import "./style.css"
import React, {useEffect, useState} from "react";
import {Tab} from "../tab/tab";
import {TMessage} from "../../../general/types";
import {eventBus} from "../utils";

// import {listNode} from "../../../nodes/nodes";

let mess: ({type, data}: TMessage) => void;
eventBus.addEventListener('message-socket', param => mess && mess(param));

let listRun;

export function Right({onNodeSelect, listNode}) {

    const [update, setUpdate] = useState(new Date())

    useEffect(() => {
        mess = ({type, data}: TMessage) => {
            switch (type) {
                case "list-run":
                    // console.log(data)
                    listRun = Object.values(data).map(it => {
                        // const [name, id] = it;
                        return <div>{`${it.name}:(${it.id})`}</div>
                    })
                    setUpdate(new Date())
                    break;
            }
        };

    }, [])


    let arrTab = [
        ['Сервисы', <div>{listRun}</div>, 'right-tab'],
        ['log', <div>456</div>, '']
    ];
    return (
        <div className="right">
            <Tab arrTab={arrTab}/>
        </div>
    )
}