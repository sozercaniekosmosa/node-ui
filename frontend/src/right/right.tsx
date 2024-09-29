import "./style.css"
import React, {useEffect, useRef, useState} from "react";
import {Tab} from "../tab/tab";
import {TMessage} from "../../../general/types";
import {eventBus} from "../utils";
import Log from "./components/log";

let mess: ({type, data}: TMessage) => void;
eventBus.addEventListener('message-socket', param => mess && mess(param));

let listRun;

export function Right({onEvent}) {

    const [update, setUpdate] = useState(new Date())
    const [logMess, setLogMess] = useState('')
    const refRunningService = useRef(null);

    useEffect(() => {
        mess = ({type, data}: TMessage) => {
            switch (type) {
                case "list-run":
                    listRun = Object.values(data).map((it, idx) => {
                        return <div key={idx} data-id={it.id}>{`${it.name}:(${it.id})`}</div>
                    })
                    setUpdate(new Date())
                    break;
                case 'log':
                    setLogMess(JSON.stringify(data))
                    break;
                case 'node-log':
                case 'node-log-output':
                    setLogMess(JSON.stringify(data))
                    break;
            }
        };

    }, [])

    function selectRanService({target}) {
        onEvent({name: 'node-select', data: target.dataset.id})
        let arrNode = [...refRunningService.current.querySelectorAll('.service--selected')];
        arrNode.forEach(node => node.classList.remove('service--selected'));
        target.classList.add('service--selected')
        console.log(target.dataset.id)
    }

    function openProperty() {
        onEvent({name: 'property-open'})
    }

    let arrTab = [
        ['Сервисы', <div onDoubleClick={openProperty} onClick={selectRanService} ref={refRunningService}>{listRun}</div>, 'right-tab'],
        ['log', <Log logMess={logMess}/>, 'right-tab']
    ];
    return (
        <div className="right">
            <Tab arrTab={arrTab}/>
        </div>
    )
}