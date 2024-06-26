import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {Property} from "./property";
import {Toolbox} from "./toolbox/toolbox";
import NODEUI from "./node-ui";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);

// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);

function Editor() {
    const [nodeProp, setNodePropProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);
    let [reset, setIsReset] = useState(()=>()=>{});

    let onDblClick = ({target}) => {
        console.log(target)
        setNodePropProp(target)
    };

    let onNodeAdded = () => {
        setNodeDataSelected(null);
        reset()
    }
    return (
        <div className="node " onDoubleClick={onDblClick}>
            <Toolbox reset={setIsReset} onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <NODEUI addNodeToCanvas={nodeDataSelected} onNodeAdded={onNodeAdded}/>
            <Property chosenNode={nodeProp}/>
        </div>)
}

root.render(<Editor/>);
