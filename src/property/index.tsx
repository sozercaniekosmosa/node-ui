import "./style.css"
import {useEffect, useState} from "react";

export function Property() {

    const [arr, setArr] = useState(['Item 1', 'Item 2', 'Item 3']);

    useEffect(() => {
    }, []);

    return (
        <div className="property">
            <div className="property__header">
                <div>Конфигуратор</div>
                <div className="property__button icon-cross"></div>
            </div>
            <button onClick={() => {
                setArr(prevArr => [...prevArr, new Date().getTime() + '']);
            }}>click
            </button>
            <div className="property__body">
                {arr.map((item, i) => (<div key={i}>{item}</div>))}
            </div>
            <div className="property__footer"></div>
        </div>
    )
}