import "./style.css";
import {useEffect, useRef, useState} from "react";
import {formatDateTime} from "../../utils";

let idx = 0;
const arrMess = [];

const log = (node, message, strClass = '') => {
    arrMess.push(<div className={strClass} key={idx++}><i>{formatDateTime() + ': '}</i>{message}</div>);
    if (arrMess.length > 100) arrMess.shift();

    // node.innerHTML += `<div class="${strClass}"><i>${formatDateTime() + ': '}</i>${message}</div>`;
    // if (node.children.length > 50) node.children[0].remove();

    let height = node.getBoundingClientRect().height;
    let off = node.scrollHeight - node.scrollTop - height;
    console.log(off)
    if (off < height / 2) setTimeout(() => {
        const arr = [...node.children];
        arr[arr.length - 1].scrollIntoView({behavior: "smooth"});
    }, 500);

    // console.log([...node.children].at(-1))

    return arrMess;
}

export default ({logMess, warnMess, errMess}) => {
    const [arrLogMess, setArrLogMess] = useState([]);
    const refLog = useRef(null);

    useEffect(() => setArrLogMess(log(refLog.current, logMess)), [logMess])

    // window.xlog = this.log = (message) => {
    //     log(message);
    // }
    // window.xwarn = this.warn = (message) => {
    //     log(message, 'log-message__warn');
    // }
    // window.xerr = this.err = (message) => {
    //     log(message, 'log-message__error');
    // }

    return <div className="log" ref={refLog}>{arrLogMess}</div>
}