import "./style.css"
import React, {InputHTMLAttributes} from "react";

export default function ({name, val, onChange}) {
    return <>
        <input className="param__string" type="text" defaultValue={val}
               onBlur={({target}) => onChange(name, target.value)}
               onKeyDown={({target, key}) => {
                   if (key == 'Enter') onChange(name, (target as InputHTMLAttributes<string>).value)
               }}/></>
}