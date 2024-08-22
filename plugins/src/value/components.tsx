import {InputHTMLAttributes} from "react";

interface Number2Props {
    name: string;
    val: number;
    onChange: (name: string, newValue: number, oldValue: number) => void;
}

export const number2 = ({name, val, onChange}: Number2Props) => {
    return <input className="prop__param__number" type="number"
                  defaultValue={val}
                  onBlur={({target}) => {
                      console.log(Number(target.value) + 'N2')
                      onChange(name, Number(target.value), val)
                  }}
                  onKeyDown={({target, key}) => {
                      if (key == 'Enter') onChange(name, Number((target as InputHTMLAttributes<string>).value), val)
                  }}/>;
};