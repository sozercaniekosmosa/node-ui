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
import {decompress, compress, decompressString, compressString} from './utils'
import {eventBus} from "./utils"

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
const history = new History();
let nui = null;
let arrSelected: Element[] | undefined = [];
let arrKey = [];
let nodeFocus;

function Root() {

    document.addEventListener('keyup', e => arrKey[e.code.toLowerCase()] = false, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('blur', () => arrKey = [], true);
    document.addEventListener('focus', ({target}) => nodeFocus = target, true);

    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);

    function onKeyDown(e) {
        arrKey[e.code.toLowerCase()] = true;
        if (arrKey?.['controlleft'] && arrKey?.['keyz']) onUndo();
        if (arrKey?.['controlleft'] && arrKey?.['keyy']) onRedo();
        if (arrKey?.['delete'] && arrSelected!.length > 0 && nodeFocus.classList.contains('editor')) {
            eventBus.dispatchEvent('confirm', (isYes) => isYes && nui.removeNode(), 'Уверены?')
        }
        if ((arrKey?.['enter'] || arrKey?.['numpadenter']) && arrSelected!.length === 1 && nodeFocus.classList.contains('editor')) {
            eventBus.dispatchEvent('menu-property-show')
            setNodeProp((arrSelected as [])[0])
        }
        // console.log(e.code.toLowerCase())
    }

    let onDblClick = ({target}) => {
        const node = target.closest('.' + NodeSelector.node)
        if (node) {
            eventBus.dispatchEvent('menu-property-show')
            setNodeProp(node)
        }
    };

    let onPropertyChange = (node, val) => {
        // console.log(node, val)
        history.addHistory('property', nui.svg.innerHTML);
    };

    function onUndo() {
        let data = history.undoHistory();
        data && (nui.svg.innerHTML = data);
    }

    function onRedo() {
        let data = history.redoHistory();
        data && (nui.svg.innerHTML = data);
    }


    let onCopy = () => {
        function elementToObject(node: HTMLElement) {
            var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
            var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];
            let cfgIn = [], cfgOut = [];
            if (arrIn.length) cfgIn = arrIn.map(node => node.dataset.name);
            if (arrOut.length) cfgOut = arrOut.map(node => node.dataset.name)
            let cfg = {
                name: node.dataset.node, description: node.dataset.description, in: cfgIn, out: cfgOut,
            };
            if (node.dataset?.cfg) cfg["cfg"] = JSON.parse(decompressString(node.dataset.cfg)!);
            return cfg;
        }

        let arrCfg = [];
        let arrNode = arrSelected?.map(node => node.cloneNode(true)) as HTMLElement[];
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

    let onEventEditor = ({name, nui: nodeUi, arrSelect: arrSel}: TEventData) => {
        switch (name) {
            case 'init':
                nui = nodeUi;
                history.initHistory(nui.svg.innerHTML);
                break;
            case 'selected':
                arrSelected = arrSel;
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                history.addHistory(name, nui.svg.innerHTML);
                break;

        }
    }

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
            <Property setNode={nodeProp} onChange={onPropertyChange}/>
        </div>
        <MenuConfirm show={'confirm'}/>
    </>)
}

root.render(<Root/>);