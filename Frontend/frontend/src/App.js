import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CreateUser from "./page/User/CreateUser";
import Login from "./page/Login";
import Home from "./page/Home";
import Major from "./page/Major";
import CreateBLog from './page/CreateBlog';
import EditBlog from './page/EditBlog';
import BlogDetail from "./page/BlogDetail";
import './App.css';

function checkToken() {
  const token = localStorage.getItem("accessToken");
  return token ? true : false;
}

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path = "/createuser" element ={<CreateUser/> }/>
          <Route path = "/major" element ={<Major/> }/>
          <Route path = "/home" element ={checkToken() ? <Home/> : <Navigate to="/"/>}/>
          <Route path="/createblog" element={checkToken() ? <CreateBLog /> : <Navigate to="/"/>} />
          <Route path="/editblog" element={checkToken() ? <EditBlog /> : <Navigate to="/"/>} />
          <Route path="/blogdetail" element={checkToken() ? <BlogDetail /> : <Navigate to="/"/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
