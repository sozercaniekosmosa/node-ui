import Node from "./Node";
import {loadPyodide} from "pyodide";

let pyodide;
const evalJS = async (task, data) => {
    try {
        const debug = task.cfg[0][1];
        const {code, lang} = task.cfg[1][1];

        if (!code) return;

        if (lang == 'javascript') {
            return eval(code)(data?.in)
        } else if (lang == 'python') {
            !pyodide && (pyodide = await loadPyodide());
            return pyodide.runPython(code);
        }
    } catch (e) {
        console.log(e)
    }
};

await Node(evalJS)



