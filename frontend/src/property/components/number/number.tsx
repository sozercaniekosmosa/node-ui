import "./style.css"
import React, {InputHTMLAttributes} from "react";

export default function ({name, val, onChange}) {
    return <>
        <input className="param__number" type="number" defaultValue={val}
               onBlur={({target}) => onChange(name, Number(target.value))}
               onKeyDown={({target, key}) => {
                   if (key == 'Enter') onChange(name, Number((target as InputHTMLAttributes<string>).value))
               }}/></>
}