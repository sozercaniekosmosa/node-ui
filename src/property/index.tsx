import "./style.css"
import React, {useEffect, useState} from "react";

export function Property({chosenNode}) {

    const [arr, setArr] = useState(['Item 1', 'Item 2', 'Item 3']);

    // useEffect(() => {
    //     console.log(chosenNode)
    // }, [chosenNode]);

    return(
        <div className="property">
            <div className="property__header">
                <div>Конфигуратор{chosenNode?.nodeName}</div>
                <div className="property__button icon-cross"></div>
            </div>
            <button onClick={() => {
                setArr(val => [...val, val.length + 1 + '']);
            }}>click
            </button>
            <div className="property__body">
                {arr.map((item, i) => (<div key={i}>{item}</div>))}
            </div>
            <div className="property__footer"></div>
        </div>)
}