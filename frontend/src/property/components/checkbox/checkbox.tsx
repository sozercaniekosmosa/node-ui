import "./style.css"
import React, {InputHTMLAttributes, useEffect, useState} from "react";

let checked=false;
export default function ({name, val, onChange}) {
    const [update, setUpdate] = useState(new Date())

    useEffect(() => {
        checked = val
        setUpdate((v) => v + 1)
    }, [])

    function changeCheckbox({target}) {
        checked = target.checked;
        setUpdate(new Date())
        onChange(name, target.checked)
    }

    return <input className="param__string" type="checkbox" checked={checked} onChange={changeCheckbox}/>
}