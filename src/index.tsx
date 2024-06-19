import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import NodeUI from './node-ui/';
// import {NodeUI} from './node-ui/node-ui';

const root = ReactDOM.createRoot(document.querySelector('.editor') as HTMLElement);
// root.render(<React.StrictMode><App/></React.StrictMode>);
root.render(<NodeUI/>);
