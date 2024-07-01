import React from "react";
import "./style.css";

export function Button({children, onClick}) {
    return <div className="button" onClick={onClick}>{children}</div>;
}