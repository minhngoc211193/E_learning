import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CreateUser from "./page/User/CreateUser";
import ManageUser from "./page/ManageUser";
import Login from "./page/Login";
import Home from "./page/Home";
import Major from "./page/Major";
import Subject from "./page/Subject";
import CreateBLog from './page/CreateBlog';
import EditBlog from './page/EditBlog';
import BlogDetail from "./page/BlogDetail";
import ManageBlog from './page/ManageBlog';
import ManageClass from './page/ManageClass';
import Document from './page/Document';

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
          <Route path = "/createuser" element ={checkToken() ? <CreateUser/>: <Navigate to="/"/>  }/>
          <Route path = "/manageuser" element ={checkToken() ? <ManageUser/>: <Navigate to="/"/>  }/>
          <Route path = "/major" element ={ checkToken() ? <Major/>: <Navigate to="/"/> }/>
          <Route path = "/home" element ={checkToken() ? <Home/> : <Navigate to="/"/>}/>
          <Route path="/createblog" element={checkToken() ? <CreateBLog /> : <Navigate to="/"/>} />
          <Route path="/editblog/:id" element={checkToken() ? <EditBlog /> : <Navigate to="/"/>} />
          <Route path="/blogdetail/:id" element={checkToken() ? <BlogDetail /> : <Navigate to="/"/>} />
          <Route path="/manageblog" element={checkToken() ? <ManageBlog /> : <Navigate to="/"/>} />
          <Route path="/subject" element={checkToken() ? <Subject /> : <Navigate to="/"/>} />
          <Route path="/manageclass" element={checkToken() ? <ManageClass /> : <Navigate to="/"/>} />
          <Route path="/document" element={checkToken() ? <Document /> : <Navigate to="/"/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
