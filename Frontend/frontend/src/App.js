import React, {useState, Navigate} from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateUser from "./page/CreateUser";
import Login from "./page/Login";
import Home from "./page/Home";
import BlogDetail from "./page/BlogDetail";
import './App.css';
import Register from './page/Register';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path = "/createuser" element ={<CreateUser/> }/> */}
          <Route path = "/home" element ={<Home/> }/>
          <Route path="/blogdetail" element={<BlogDetail />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
