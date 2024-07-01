import React, {useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {Property} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import Editor from "./editor/editor";
import {Header} from "./header/header";
import {NodeSelector} from "./editor/node-ui/node-ui";
import {Button} from "./auxiliary/button/button";
import {MenuConfirm} from "./auxiliary/menu/menu-confirm";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
let key = [];

// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);

function Root() {
    const refArrSelect = useRef(false);
    const [confirmShow, setConfirmShow] = useState(() => () => true);
    const [remove, setRemove] = useState(() => () => true);
    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);
    let [reset, setReset] = useState(() => () => true);

    let onDblClick = ({target}) => {
        const node = target.closest('.' + NodeSelector.node)
        if (node) setNodeProp(node)
    };

    function onKeyDown(e) {
        key[e.code.toLowerCase()] = true;
        if (key['delete']) refArrSelect.current && confirmShow();
        if (key['f5'] || key['f12']) return
    }

    function onKeyUp(e) {
        key[e.code.toLowerCase()] = false;
    }

    let onNodeAdded = () => {
        setNodeDataSelected(null);
        reset();
    }

    let onSelect = arrSelect => refArrSelect.current = (arrSelect.length > 0);

    return (<>
        <Header className="menu"/>
        <div className="node " onDoubleClick={onDblClick} onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex="-1">
            <Toolbox controlReset={setReset} onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor addNodeToCanvas={nodeDataSelected} onNodeAdded={onNodeAdded} controlRemove={setRemove}
                    onSelect={onSelect}/>
            <Property setNode={nodeProp}/>
        </div>
        <MenuConfirm constrolShow={setConfirmShow} onClickYes={() => remove()}>Уверены?</MenuConfirm>
    </>)
}

root.render(<Root/>);
