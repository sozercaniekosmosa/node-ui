import Node from "./Node";
import {loadPyodide} from "pyodide";

const {sendMessage} = await Node(evalJS)

let pyodide;

async function evalJS(task, data) {
    const debug = task.cfg.debug[0];
    try {
        const {code, lang} = task.cfg.codeEditor[0];

        if (!code) return;

        if (lang == 'javascript') {
            return eval(code)(data?.in)
        } else if (lang == 'python') {
            !pyodide && (pyodide = await loadPyodide());
            return pyodide.runPython(code);
        }
    } catch (e) {
        console.log(e)
        debug && await sendMessage('node-log-error', {id: task.id, message:e.toString()});
    }
}



