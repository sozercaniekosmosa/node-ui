import "./style.css"
import React, {InputHTMLAttributes} from "react";

export default function ({name, val, onChange}) {
    return <input className="param__string" type="checkbox" checked={val} onChange={({target}) => onChange(name, target.checked)}/>
}