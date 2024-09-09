import "./style.css"
import React, {useEffect, useRef, useState} from "react";
import backend from "../../../service/service-backend";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-kuroir";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-textmate";
import "ace-builds/src-noconflict/theme-solarized_dark";
import "ace-builds/src-noconflict/theme-solarized_light";
import "ace-builds/src-noconflict/theme-terminal";

import "ace-builds/src-noconflict/ext-language_tools";
import "ace-builds/src-noconflict/ext-inline_autocomplete";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/snippets/javascript";

import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/snippets/python";

let code;
export default function ({name, val, onChange, node}) {

    code = val.code
    const [lang, setLang] = useState(val.lang ?? 'javascript')
    const [theme, setTheme] = useState(val.theme ?? 'github')

    // eventBus.addEventListener('message-socket', ({type, dest, data}: TMessage) => {
    //     switch (type) {
    //         case "node-status":
    //             break;
    //     }
    // })

    function changeCode(newValue) {
        code = newValue;
        onChange(name, {code, lang, theme})
    }

    function changeTheme({target}) {
        setTheme(target.value)
        onChange(name, {code, lang, theme: target.value})
    }

    function changeLang({target}) {
        setLang(target.value)
        onChange(name, {code, lang: target.value, theme})
    }

    return <div className="code-editor">
        <div className="code-editor__control">
            <select name="Theme" onChange={changeTheme} value={theme!}>
                <option value="monokai">monokai</option>
                <option value="github">github</option>
                <option value="tomorrow">tomorrow</option>
                <option value="kuroir">kuroir</option>
                <option value="twilight">twilight</option>
                <option value="xcode">xcode</option>
                <option value="textmate">textmate</option>
                <option value="solarized_dark">solarized_dark</option>
                <option value="solarized_light">solarized_light</option>
                <option value="terminal">terminal</option>
            </select>&nbsp;
            <select name="Lang" onChange={changeLang} value={lang!}>
                <option value="javascript">javascript</option>
                <option value="python">python</option>
            </select>
        </div>
        <AceEditor
            className="code-editor__editor"
            width="100%"
            height="100%"
            mode={lang}
            theme={theme}
            onChange={changeCode}
            name="ace-editor"
            editorProps={{$blockScrolling: true}}
            setOptions={{
                useWorker: false,
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
                enableSnippets: true
            }}
            value={code}
        />
    </div>
}