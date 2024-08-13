import React, {MutableRefObject, useRef, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import './auxiliary/icon/style.css';
import {Property, TEventProperty} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import {Editor, TEventEditor} from "./editor/editor";
import {Header, TEventHeader} from "./header/header";
import History from './history'
import Service from './service'
import {MenuConfirm} from "./auxiliary/menu/menu-confirm";
import {eventBus} from "./utils"

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
const history = new History();
let service;
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
        const code = e.code.toLowerCase();
        if (arrKey[code]) return;
        arrKey[code] = true;

        if (arrKey?.['escape']) arrKey = [];
        if (arrKey?.['controlleft'] && arrKey?.['keyz']) onEventHandler({name: 'undo'});
        if (arrKey?.['controlleft'] && arrKey?.['keyy']) onEventHandler({name: 'redo'});
        if (arrKey?.['controlleft'] && arrKey?.['keyc']) {
            onEventHandler({name: 'copy'})
            e.preventDefault();
        }
        if (arrKey?.['controlleft'] && arrKey?.['keyv']) onEventHandler({name: 'past'})
        if (arrKey?.['controlleft'] && arrKey?.['keyx']) onEventHandler({name: 'cut'})

        if (arrKey?.['delete'] && nodeFocus.classList.contains('editor')) onEventHandler({name: 'delete'})
        if ((arrKey?.['enter'] || arrKey?.['numpadenter']) && nodeFocus.classList.contains('editor')) onEventHandler({name: 'property'});

        // console.log(arrKey)
        // console.log(e.code.toLowerCase())
    }

    let onEventHandler = ({name, data}: TEventEditor | TEventHeader | TEventProperty) => {
        switch (name) {
            case 'init':
                nui = data;
                service = new Service(nui);
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
                let undoHistory = history.undoHistory();
                undoHistory && (nui.svg.innerHTML = undoHistory);
                break;
            case 'redo':
                let redoHistory = history.redoHistory();
                redoHistory && (nui.svg.innerHTML = redoHistory);
                break;
            case 'copy':
                service.onCopy();
                break;
            case 'past':
                service.onPast();
                history.addHistory('past', nui.svg.innerHTML);
                break;
            case 'cut':
                service.onCut();
                history.addHistory('cut', nui.svg.innerHTML);
                break;
            case 'delete':
                if (arrSelected!.length > 0)
                    eventBus.dispatchEvent('confirm', (isYes) => isYes && nui.removeNode(), 'Уверены?')
                break;
            case 'property':
                if (arrSelected?.length !== 1) return
                setNodeProp((arrSelected as [])[0])
                eventBus.dispatchEvent('menu-property-show')
                break;
            case 'property-change':
                history.addHistory('property', nui.svg.innerHTML);
                break;
        }
    }

    return (<>
        <Header className="menu" onEvent={onEventHandler}></Header>
        <div className="node-editor" onDoubleClick={() => onEventHandler({name: 'property'})}>
            <Toolbox onNodeSelect={(data) => setNodeDataSelected(data)}/>
            <Editor newNode={nodeDataSelected} onEvent={onEventHandler}/>
            <Property setNode={nodeProp} onChange={() => onEventHandler({name: 'property-change'})}/>
        </div>
        <MenuConfirm name={'confirm'}/>
    </>)
}

root.render(<Root/>);