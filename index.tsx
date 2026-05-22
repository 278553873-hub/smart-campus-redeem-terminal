
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@arco-design/web-react/dist/css/arco.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
