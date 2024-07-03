import React, {MutableRefObject, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import {Property} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import {Editor, TEventData} from "./editor/editor";
import {Header} from "./header/header";
import {NodeSelector, NodeUI} from "./editor/node-ui/node-ui";
import {History} from './auxiliary/history'
import {Button} from "./auxiliary/button/button";
import {MenuConfirm} from "./auxiliary/menu/menu-confirm";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
const history = new History();
let nui = null;

function Root() {

    const refArrSelect = useRef(false);
    const [propertyShow, setPropertyShow] = useState(() => () => true);
    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);

    let onDblClick = ({target}) => {
        const node = target.closest('.' + NodeSelector.node)
        if (node) {
            propertyShow();
            setNodeProp(node)
        }
    };

    let onPropertyChange = (node, val) => {
        console.log(node, val)
    };

    let onEventEditor = ({name, nui: nodeUi, arrSelect, arrKey}: TEventData) => {
        switch (name) {
            case 'init':
                nui = nodeUi;
                history.initHistory(nui.svg.innerHTML);
                break;
            case 'selected':
                refArrSelect.current = (arrSelect?.length > 0)
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                history.addHistory(name, nui.svg.innerHTML);
                break;
            case 'key-down':
                if (arrKey?.['controlleft'] && arrKey?.['keyz'])
                    onUndo();
                if (arrKey?.['controlleft'] && arrKey?.['keyy'])
                    onRedo();
                break;
            case 'key-up':
                break;

        }
    }

    let onUndo = () => {
        let data = history.undoHistory();
        data && (nui.svg.innerHTML = data);
    };
    let onRedo = () => {
        let data = history.redoHistory();
        data && (nui.svg.innerHTML = data);
    };
    return (<>
        <Header className="menu">
            <Button onClick={onUndo}>
                <div className="icon-undo"/>
            </Button>
            <Button onClick={onRedo}>
                <div className="icon-redo"/>
            </Button>
        </Header>
        <div className="node-editor" onDoubleClick={onDblClick}>
            <Toolbox onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor newNode={nodeDataSelected} onEvent={onEventEditor}/>
            <Property setNode={nodeProp} controlShow={setPropertyShow} onChange={onPropertyChange}/>
        </div>
    </>)
}

root.render(<Root/>);
