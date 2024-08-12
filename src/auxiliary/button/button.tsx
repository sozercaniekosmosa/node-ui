import React from "react";
import "./style.css";

export function Button({children, onClick, hint}) {
    return <div title={hint ? hint : ''} className="button" onClick={onClick} tabIndex="-1">{children}</div>;
}