import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import CreateUser from "./page/User/CreateUser";
import Login from "./page/Login";
import Home from "./page/Home";
import Major from "./page/Major";
import BlogDetail from "./page/BlogDetail";

import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path = "/createuser" element ={<CreateUser/> }/>
          <Route path = "/major" element ={<Major/> }/>
          <Route path = "/home" element ={<Home/> }/>
          <Route path="/blogdetail" element={<BlogDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
