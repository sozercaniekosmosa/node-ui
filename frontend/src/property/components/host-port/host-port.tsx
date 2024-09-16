import "./style.css"
import {isAllowHostPort, startTask, stopTask} from "../../../service/service-backend";
import React, {useEffect, useRef, useState} from "react";

function validationHost(host, node: HTMLElement) {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
    const localhostRegex = /^(localhost|127\.0\.0\.\d)$/;

    const isValid = ipv4Regex.test(host) || domainRegex.test(host) || localhostRegex.test(host);

    if (isValid) {
        node.classList.remove('host-port--invalid')
    } else {
        node.classList.add('host-port--invalid')
    }

    return isValid
}

function validationPort(port, node: HTMLElement) {
    const isValid = !(+port > 65535 || +port < 0);
    if (isValid) {
        node.classList.remove('host-port--invalid')
    } else {
        node.classList.add('host-port--invalid')
    }

    return isValid;
}

export default function ({name, val, onChange, node}) {

    let [status, setStatus] = useState('...');
    let [host, setHost] = useState(val.host);
    let [port, setPort] = useState(val.port);
    const refHostPort = useRef(null)
    const refHost = useRef(null)
    const refPort = useRef(null)

    useEffect(() => {
        changeHandling();
    }, [])

    async function changeHandling() {
        setStatus('...')

        const host = refHost.current.value;
        const port = +refPort.current.value;

        const isValidHost = validationHost(host, refHost.current);
        const isValidPort = validationPort(port, refPort.current);

        const isAllowHP = await isAllowHostPort(host, port, node.id);

        const isAllow = isValidHost && isValidPort && isAllowHP;

        setStatus(isAllow ? '✔' : '✖');
        if (isAllow) onChange(name, {host, port})
    }

    return <div className="host-port__group" ref={refHostPort}>
            <input className="host-port__host" type="text" value={host!}
                   onChange={({target}) => setHost(target.value)}
                   onBlur={changeHandling}
                   onKeyDown={({key}) => (key == 'Enter') && changeHandling()}
                   ref={refHost}/>:
            <input className="host-port__port" type="number" value={port!}
                   onChange={({target}) => setPort(target.value)} min="0" max="65535"
                   onBlur={changeHandling}
                   onKeyDown={({key}) => (key == 'Enter') && changeHandling()}
                   ref={refPort}/>
            <div className={'host-port__state--' + (status == '✔' ? 'valid' : 'error')}>{status}</div>
    </div>
}