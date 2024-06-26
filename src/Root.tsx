import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {Property} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import Editor from "./editor/editor";
import {Menu} from "./menu/menu";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);

// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);

function Root() {
    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);
    let [reset, setReset] = useState(() => () => {
    });

    let onDblClick = ({target}) => {
        setNodeProp(target)
    };

    let onNodeAdded = () => {
        setNodeDataSelected(null);
        reset();
    }
    return (<>
        <Menu className="menu"/>
        <div className="node " onDoubleClick={onDblClick}>
            <Toolbox getReset={setReset} onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor addNodeToCanvas={nodeDataSelected} onNodeAdded={onNodeAdded}/>
            <Property setNode={nodeProp}/>
        </div>
    </>)
}

root.render(<Root/>);
