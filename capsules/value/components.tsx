import React, {InputHTMLAttributes} from "react";


export function number2({name, val, onChange}) {
    return <input className="prop__param__number" type="number" defaultValue={val}
                  onBlur={({target}) => {
                      console.log(Number(target.value) + 'N2')
                      onChange(name, Number(target.value), val)
                  }}
                  onKeyDown={({target, key}) => {
                      if (key == 'Enter') onChange(name, Number((target as InputHTMLAttributes<string>).value), val)
                  }}/>
}