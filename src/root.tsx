import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import './auxiliary/icon/style.css';
import {Property, TEventProperty} from "./property/property";
import {Toolbox} from "./toolbox/toolbox";
import {Editor, TEventEditor} from "./editor/editor";
import {Header, TEventHeader} from "./header/header";
import History from './service/history'
import {MenuConfirm} from "./auxiliary/menu/menu-confirm";
import {apiRequest, camelToKebab, compressString, decompressString, eventBus} from "./utils"
import {writeProject, readProject, getNodeStruct, startTask, stopTask} from './service/service-backend'
import {copy, past, cut} from "./service/cpc";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
let history;
let nui = null;
let arrSelected: Element[] | undefined = [];
let arrKey = [];

let nodeFocus;

function Root() {

    document.addEventListener('keyup', e => arrKey[camelToKebab(e.code).toLowerCase()] = false, true);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('blur', () => arrKey = [], true);
    document.addEventListener('focus', ({target}) => nodeFocus = target, true);

    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);

    function onKeyDown(e) {
        const code = camelToKebab(e.code).toLowerCase();
        if (arrKey[code]) return;
        arrKey[code] = true;

        if (arrKey?.['escape']) arrKey = [];
        if (arrKey?.['control-left'] && arrKey?.['key-s']) {
            onEventHandler({name: 'save'});
            e.preventDefault();
        }
        if (arrKey?.['control-left'] && arrKey?.['key-z']) onEventHandler({name: 'undo'});
        if (arrKey?.['control-left'] && arrKey?.['key-y']) onEventHandler({name: 'redo'});
        if (arrKey?.['control-left'] && arrKey?.['key-c']) {
            onEventHandler({name: 'copy'})
            e.preventDefault();
        }
        if (arrKey?.['control-left'] && arrKey?.['key-v']) onEventHandler({name: 'past'})
        if (arrKey?.['control-left'] && arrKey?.['key-x']) onEventHandler({name: 'cut'})

        if (arrKey?.['delete'] && nodeFocus?.classList.contains('editor')) onEventHandler({name: 'delete'})
        if ((arrKey?.['enter'] || arrKey?.['numpadenter']) && nodeFocus.classList.contains('editor')) onEventHandler({name: 'property'});

        // console.log(arrKey)
        // console.log(e.code.toLowerCase())
    }

    const addHistory = (name, data) => {
        history.addHistory(name, nui.svg.innerHTML);
        writeProject(nui.svg);
    }

    let onEventHandler = async ({name, data}: TEventEditor | TEventHeader | TEventProperty) => {
        switch (name) {
            case 'init':
                nui = data;
                nui.svg.innerHTML = await readProject();
                history = new History(nui.svg.innerHTML, 20);
                break;
            case 'selected':
                arrSelected = data;
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                addHistory(name, nui.svg.innerHTML);
                break;

            case 'undo':
                let undoHistory = history.undoHistory();
                if (undoHistory) {
                    nui.svg.innerHTML = undoHistory;
                    writeProject(nui.svg);
                }
                break;
            case 'redo':
                let redoHistory = history.redoHistory();
                if (redoHistory) {
                    nui.svg.innerHTML = redoHistory;
                    writeProject(nui.svg);
                }
                break;
            case 'copy':
                copy(nui);
                break;
            case 'past':
                past(nui);
                addHistory('past', nui.svg.innerHTML);
                break;
            case 'cut':
                cut(nui);
                addHistory('cut', nui.svg.innerHTML);
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
                addHistory('property', nui.svg.innerHTML);
                break;
            case 'save':
                writeProject(nui.svg);
                break;
            case 'start':
                eventBus.dispatchEvent('confirm', (isYes) => isYes && startTask(), 'Запустить стстему?')
                break;
            case 'stop':
                eventBus.dispatchEvent('confirm', (isYes) => isYes && stopTask(), 'Остановить стстему?')
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