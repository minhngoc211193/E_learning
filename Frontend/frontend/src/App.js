import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CreateUser from "./page/User/CreateUser";
import Login from "./page/Login";
import Home from "./page/Home";
import Major from "./page/Major";
import Subject from "./page/Subject";
import CreateBLog from './page/CreateBlog';
import EditBlog from './page/EditBlog';
import BlogDetail from "./page/BlogDetail";
import ManageBlog from './page/ManageBlog';
import FirstLogin from './page/Password/FirstLogin';
import ChangePassword from './page/Password/ChangePassword';
import ResetPassword from './page/Password/ResetPassword';
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
          <Route path="/firstlogin" element={<FirstLogin />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path = "/createuser" element ={checkToken() ? <CreateUser/>: <Navigate to="/"/>  }/>
          <Route path = "/major" element ={ checkToken() ? <Major/>: <Navigate to="/"/> }/>
          <Route path = "/home" element ={checkToken() ? <Home/> : <Navigate to="/"/>}/>
          <Route path="/createblog" element={checkToken() ? <CreateBLog /> : <Navigate to="/"/>} />
          <Route path="/editblog/:id" element={checkToken() ? <EditBlog /> : <Navigate to="/"/>} />
          <Route path="/blogdetail/:id" element={checkToken() ? <BlogDetail /> : <Navigate to="/"/>} />
          <Route path="/manageblog" element={checkToken() ? <ManageBlog /> : <Navigate to="/"/>} />
          <Route path="/subject" element={checkToken() ? <Subject /> : <Navigate to="/"/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
