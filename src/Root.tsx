import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {Property} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import Editor from "./editor/editor";
import {Menu} from "./menu/menu";
import {NodeSelector} from "./editor/node-ui/node-ui";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
let key = [];

// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);

function Root() {
    const [remove, setRemove] = useState([]);
    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);
    let [reset, setReset] = useState(() => () => {
    });

    let onDblClick = ({target}) => {
        const node = target.closest('.' + NodeSelector.node)
        if (node) setNodeProp(node)
    };

    function onKeyDown(e) {
        key[e.code.toLowerCase()] = true;
        if (key['delete']) this.remove();
        if (key['escape']) this.resetMode(this.mode);
        // console.log(key)
        if (key['f5'] || key['f12']) return
        // e.preventDefault();
        // document.dispatchEvent(new CustomEvent('svgkeydown', {detail: {...key}}))
    }

    function onKeyUp(e) {
        key[e.code.toLowerCase()] = false;
        // document.dispatchEvent(new CustomEvent('svgkeyup', {detail: {...key}}))
    }

    let onNodeAdded = () => {
        setNodeDataSelected(null);
        reset();
    }
    return (<>
        <Menu className="menu"/>
        <div className="node " onDoubleClick={onDblClick} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex="-1">
            <Toolbox getReset={setReset} onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor addNodeToCanvas={nodeDataSelected} onNodeAdded={onNodeAdded} getRemove={setRemove}/>
            <Property setNode={nodeProp}/>
        </div>
    </>)
}

root.render(<Root/>);
