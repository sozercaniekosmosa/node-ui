import "./style.css"
import React, {InputHTMLAttributes, useEffect, useRef} from "react";
import {TChangeProps, TMessage} from "../../../../../general/types";
import {startTask, stopTask} from "../../../service/service-backend";
import {eventBus} from "../../../utils";

export default function ({name, val, onChange, node}: TChangeProps) {

    const refStartBtn = useRef(null);
    const refStopBtn = useRef(null);

    const setStatus = (isStart) => {
        if (isStart == 'run') {
            refStartBtn.current && refStartBtn.current.classList.add('task-control__btn--start')
            refStopBtn.current && refStopBtn.current.classList.remove('task-control__btn--stop')
        } else {
            refStartBtn.current && refStartBtn.current.classList.remove('task-control__btn--start')
            refStopBtn.current && refStopBtn.current.classList.add('task-control__btn--stop')
        }
    }

    useEffect(() => {
        setStatus(node.dataset.state)
        eventBus.addEventListener('message-socket', ({type, data}: TMessage) => {
            if (!node && data && node.id != data.id) return;

            switch (type) {
                case "server-init":
                    setStatus('stop');
                    break;
                case "node-status":
                    setStatus(data.state);
                    break;
            }
        });
    }, [])

    return <div className="task-control">
        <button onClick={() => eventBus.dispatchEvent('confirm', async (isYes) => isYes && await startTask(node.id), 'Запустить задачу?')}
                className="task-control__btn" ref={refStartBtn}>
            Пуск
        </button>
        <button onClick={() => eventBus.dispatchEvent('confirm', async (isYes) => isYes && await stopTask(node.id), 'Остановить задачу?')}
                className="task-control__btn" ref={refStopBtn}>
            Стоп
        </button>
    </div>
}