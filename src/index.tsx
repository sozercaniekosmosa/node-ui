import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import NodeUI from './node-ui';
import {Property} from "./property";

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);
root.render((<>
    <NodeUI/>
    <Property/>
</>));
