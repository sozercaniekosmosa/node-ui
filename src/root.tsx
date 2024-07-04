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
let arrSelect: Element[] | undefined = [];

function Root() {

    const refArrSelect = useRef(false);
    const [propertyShow, setPropertyShow] = useState(() => () => true);
    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);
    const [confirmShow, setConfirmShow] = useState(() => () => true);

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

    let onEventEditor = ({name, nui: nodeUi, arrSelect: arrSel, arrKey}: TEventData) => {
        switch (name) {
            case 'init':
                nui = nodeUi;
                history.initHistory(nui.svg.innerHTML);
                break;
            case 'selected':
                arrSelect = arrSel;
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                history.addHistory(name, nui.svg.innerHTML);
                break;
            case 'key-down':
                if (arrKey?.['controlleft'] && arrKey?.['keyz']) onUndo();
                if (arrKey?.['controlleft'] && arrKey?.['keyy']) onRedo();
                if (arrKey?.['delete']) confirmShow();
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

    let arrObj = [];

    function elementToObject(node: HTMLElement) {
        var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
        var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];
        let cfgIn = [], cfgOut = [];
        if (arrIn.length) cfgIn = arrIn.map(node => node.dataset.name);
        if (arrOut.length) cfgOut = arrOut.map(node => node.dataset.name)
        let cfg = {
            name: node.dataset.node, description: node.dataset.description, in: cfgIn, out: cfgOut,
        };
        if (node.dataset?.cfg) cfg["cfg"] = JSON.parse(base64to(node.dataset.cfg));
        return cfg;
    }

    let onCopy = () => {
        arrObj = [];
        let arrCfg = [];
        let arrNode = arrSelect?.map(node => node.cloneNode(true)) as HTMLElement[];
        console.log(arrNode)
        arrNode.forEach(node => {
            arrCfg.push(elementToObject(node))
        })

        console.log(arrCfg)
    }

    let onPast = () => {
        // nui.svg.
    }

    window['clone'] = onCopy;

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
        <MenuConfirm controlShow={setConfirmShow} onClickYes={() => nui.removeNode()}>Уверены?</MenuConfirm>
    </>)
}

root.render(<Root/>);

export const toBase64 = (value: string) => window.btoa(encodeURI(encodeURIComponent(value)));
export const base64to = (value: string) => decodeURIComponent(decodeURI(window.atob(value)));