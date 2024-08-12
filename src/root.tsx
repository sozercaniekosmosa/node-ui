import React, {MutableRefObject, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import './auxiliary/icon/style.css';
import {Property} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import {Editor, TEventEditor} from "./editor/editor";
import {Header, TEventHeader} from "./header/header";
import {NodeSelector, NodeUI} from "./editor/node-ui/node-ui";
import {History} from './auxiliary/history'
import {Button} from "./auxiliary/button/button";
import {MenuConfirm} from "./auxiliary/menu/menu-confirm";
import {decompress, compress, decompressString, compressString, getID} from './utils'
import {eventBus} from "./utils"

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
const history = new History();
let nui = null;
let arrSelected: Element[] | undefined = [];
let arrKey = [];
let bufArrCfg: any[] = [];
let nodeFocus;

function Root() {

    document.addEventListener('keyup', e => arrKey[e.code.toLowerCase()] = false, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('blur', () => arrKey = [], true);
    document.addEventListener('focus', ({target}) => nodeFocus = target, true);

    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);

    function onKeyDown(e) {
        const code = e.code.toLowerCase();
        if (arrKey[code]) return;
        arrKey[code] = true;

        if (arrKey?.['escape']) arrKey = [];
        if (arrKey?.['controlleft'] && arrKey?.['keyz']) onUndo();
        if (arrKey?.['controlleft'] && arrKey?.['keyy']) onRedo();
        if (arrKey?.['controlleft'] && arrKey?.['keyc']) {
            onCopy(arrKey?.['shiftleft']);
            e.preventDefault();
        }
        if (arrKey?.['controlleft'] && arrKey?.['keyv']) {
            onPast();
            // arrKey = [];
            // console.log(code)
        }
        if (arrKey?.['controlleft'] && arrKey?.['keyx']) onCut();

        if (arrKey?.['delete'] && nodeFocus.classList.contains('editor')) onDelete()
        if ((arrKey?.['enter'] || arrKey?.['numpadenter']) && nodeFocus.classList.contains('editor')) onProperty();

        console.log(arrKey)
        // console.log(e.code.toLowerCase())
    }

    function onUndo() {
        let data = history.undoHistory();
        data && (nui.svg.innerHTML = data);
    }

    function onRedo() {
        let data = history.redoHistory();
        data && (nui.svg.innerHTML = data);
    }

    let onCopy = (withLinks = false) => {
        function elementToObject(node: HTMLElement) {
            var arrIn = [...node.querySelectorAll('.' + NodeSelector.pinIn) as NodeListOf<HTMLElement>];
            var arrOut = [...node.querySelectorAll('.' + NodeSelector.pinOut) as NodeListOf<HTMLElement>];

            var arrNodeIdOut: any[];
            var arrNodeIdIn: any[];
            if (withLinks) {
                arrNodeIdOut = arrIn.map(node => node.dataset?.to ? nui.svg.querySelectorAll('#' + node.dataset.to.split(' ').join(',#')) : false);
                arrNodeIdIn = arrOut.map(node => node.dataset?.to ? nui.svg.querySelectorAll('#' + node.dataset.to.split(' ').join(',#')) : false);
            }

            let cfgIn = [], cfgOut = [];
            if (arrIn.length) cfgIn = arrIn.map(node => node.dataset.name);
            if (arrOut.length) cfgOut = arrOut.map(node => node.dataset.name)
            let cfg = {
                ...nui.getTransformPoint(node).add(10),
                nodeName: node.dataset.node,
                arrIn: cfgIn,
                arrOut: cfgOut,
                color: node.querySelector('.handle').getAttribute('fill'),
                linkIn: arrNodeIdOut,
                linkOut: arrNodeIdIn,
                data: {cfg: node.dataset.cfg}
            };

            if (node.dataset?.cfg) cfg["cfg"] = JSON.parse(decompressString(node.dataset.cfg)!);
            return cfg;
        }

        let arrCfg: any[] = [];
        let arrNode = [...nui.svg.querySelectorAll('.' + NodeSelector.selected)]?.map(node => node.cloneNode(true)) as HTMLElement[];

        if (arrNode.length == 0) return;

        arrNode.forEach(node => {
            let cfg = elementToObject(node);
            arrCfg.push(cfg)
        })

        bufArrCfg = arrCfg
    }

    let onPast = () => {
        const arrCfg = bufArrCfg
        nui.svg.querySelectorAll('.' + NodeSelector.selected).forEach(el => el.classList.remove(NodeSelector.selected));
        arrCfg.forEach(cfg => {
            const newNode = nui.createNode(cfg)
            newNode.classList.add(NodeSelector.selected)
            cfg.x += 10;
            cfg.y += 10;
        })
        history.addHistory('past', nui.svg.innerHTML);
    }

    let onCut = () => {
        onCopy(false); // false -- тк нарушаются связи после удаления
        nui.removeNode();
        history.addHistory('cut', nui.svg.innerHTML);
    }

    let onDelete = () => {
        if (arrSelected!.length > 0)
            eventBus.dispatchEvent('confirm', (isYes) => isYes && nui.removeNode(), 'Уверены?')
    }

    let onProperty = () => {
        if (arrSelected?.length !== 1) return
        setNodeProp((arrSelected as [])[0])
        eventBus.dispatchEvent('menu-property-show')
    }

    let onPropertyChange = (node, val) => {
        history.addHistory('property', nui.svg.innerHTML);
    };

    let onEventHandler = ({name, data}: TEventEditor | TEventHeader) => {
        switch (name) {
            case 'init':
                nui = data;
                history.initHistory(nui.svg.innerHTML);
                break;
            case 'selected':
                arrSelected = data;
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                history.addHistory(name, nui.svg.innerHTML);
                break;

            case 'undo':
                onUndo()
                break;
            case 'redo':
                onRedo()
                break;
            case 'copy':
                onCopy()
                break;
            case 'past':
                onPast()
                break;
            case 'cut':
                onCut()
                break;
            case 'delete':
                onDelete()
                break;
            case 'property':
                onProperty()
                break;

        }
    }

    return (<>
        <Header className="menu" onEvent={onEventHandler}></Header>
        <div className="node-editor" onDoubleClick={onProperty}>
            <Toolbox onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor newNode={nodeDataSelected} onEvent={onEventHandler}/>
            <Property setNode={nodeProp} onChange={onPropertyChange}/>
        </div>
        <MenuConfirm name={'confirm'}/>
    </>)
}

root.render(<Root/>);