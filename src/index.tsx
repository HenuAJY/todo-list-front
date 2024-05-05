import React from "react";
import ReactDOM from "react-dom/client";
import App from './App';
import "./index.css";
import "./dataApi/indexedDB";

const root = document.querySelector("#root") as Element;
ReactDOM.createRoot(root).render(<App/>);
