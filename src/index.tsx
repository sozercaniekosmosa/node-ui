import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import NodeUI from './node-ui';
import {Property} from "./property";
import {Toolbox} from "./tool-box";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);

// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);

function Editor() {
    const [node, setNode] = useState(null);
    const [tmpData, seTmpData] = useState(null);

    let onDblClick = ({target}) => {
        console.log(target)
        setNode(target)
    };
    let onChosenNode = (data) => {
        seTmpData(data)
    };
    return (
        <div className="node " onDoubleClick={onDblClick}>
            <Toolbox onChosenNode={onChosenNode}/>
            <NodeUI addNode={tmpData}/>
            <Property chosenNode={node}/>
        </div>)
}

root.render(<Editor/>);
