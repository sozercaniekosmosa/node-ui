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
import {camelToKebab, eventBus} from "./utils"
import {
    createMessageSocket, getToolbox, readProject, sendCmd, startTask, stopTask, writeProject
} from './service/service-backend'
import {copy, cut, past} from "./service/cpc";
import {NodeSelector} from "./editor/node-ui/node-ui";

// if (!import.meta.env.PROD) import listNode from "../../nodes/src/nodes"


const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
let history;
let nui = null;
let arrSelected: Element[] | undefined = [];
let arrKey = [];
let nodeFocus;

console.log(import.meta.env.MODE)
console.log(import.meta.env.PROD)
console.log(import.meta.env.VITE_SOME_KEY)

function Root() {


    let [listNode, setListNode] = useState([]);

    useEffect(() => {
        (async () => setListNode(await getToolbox() as [Object]))()
        document.addEventListener('keyup', e => arrKey[camelToKebab(e.code).toLowerCase()] = false, true);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('blur', () => arrKey = [], true);
        document.addEventListener('focus', ({target}) => nodeFocus = target, true);

    }, [])

    // (async () => {
    //     if (import.meta.env.PROD) {
    //         !listNode && setListNode((await import("../../nodes/dist/nodes.js")).default);
    //     } else {//@ts-ignore
    //         !listNode && setListNode((await import("../../nodes/src/nodes.ts")).default);
    //     }
    // })();


    const [nodeProp, setNodeProp] = useState(null);
    const [nodeDataSelected, setNodeDataSelected] = useState(null);

    function onKeyDown(e) {
        if (!e.target.classList.contains('editor')){
            // e.preventDefault();
            return;
        }
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
        if ((arrKey?.['enter'] || arrKey?.['numpad-enter']) && nodeFocus.classList.contains('editor')) onEventHandler({name: 'property'});

        // console.log(arrKey)
        // console.log(e.code.toLowerCase())
    }

    const addHistory = (name) => {
        history.addHistory(name, nui.svg.innerHTML);
        writeProject(nui.svg);
    }

    let onEventHandler = async ({name, data}: TEventEditor | TEventHeader | TEventProperty) => {
        switch (name) {
            case 'init':
                nui = data;
                nui.svg.innerHTML = await readProject();
                history = new History(nui.svg.innerHTML, 20);
                nui.selection.clearSelection();
                nui.selection.clearRectSelection();
                await createMessageSocket();
                break;
            case 'selected':
                arrSelected = data;
                break;
            case 'dragged':
            case 'link-create':
            case 'link-remove':
            case 'node-remove':
            case 'add-node':
                addHistory(name);
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
                addHistory('past');
                break;
            case 'cut':
                cut(nui);
                addHistory('cut');
                break;
            case 'delete':
                if (arrSelected!.length > 0)
                    eventBus.dispatchEvent('confirm', (isYes) => isYes && nui.removeNode(), 'Уверены?')
                break;
            case 'property':
                if (data && !data.classList.contains(NodeSelector.handle)) return
                if (arrSelected?.length !== 1) return
                const node = arrSelected[0];
                setNodeProp(node)
                eventBus.dispatchEvent('menu-property-show')
                break;
            case 'property-change':
                addHistory('property');
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
            case 'node-cmd':
                sendCmd(data.id, data.cmd)
                console.log(name, data)
                break;
        }
    }

    function onChange(newValue) {
        console.log("change", newValue);
    }

    return (<>
        <Header onEvent={onEventHandler}/>
        <div className="node-editor" onDoubleClick={({target}) => onEventHandler({name: 'property', data: target})}>
            <Toolbox onNodeSelect={(data) => setNodeDataSelected(data)} listNode={listNode}/>
            <Editor newNode={nodeDataSelected} onEvent={onEventHandler}/>
            <Property setNode={nodeProp} onEvent={onEventHandler}/>
        </div>
        <MenuConfirm name={'confirm'}/>
    </>)
}

root.render(
    // <StrictMode>
    <Root/>
    //</StrictMode>
);

