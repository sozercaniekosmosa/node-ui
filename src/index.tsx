import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import NodeUI from './node-ui';

const root = ReactDOM.createRoot(document.querySelector('.root') as HTMLElement);
// root.render(<React.StrictMode><NodeUI/></React.StrictMode>);
root.render(<NodeUI/>);
