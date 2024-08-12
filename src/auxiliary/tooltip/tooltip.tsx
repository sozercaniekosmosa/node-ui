import React, {ReactElement, useRef, useState} from "react";
import "./style.css";

type PropsType = {
    children: ReactElement;
    text: string;
    customClass?: string;
};

const ToolTipComponent: React.FC<PropsType> = ({children, text, customClass}) => {

};

export default ToolTipComponent;