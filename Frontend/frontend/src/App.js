import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import CreateUser from "./page/User/CreateUser";
import DetailUser  from './page/DetailUser';
import UpdateUser from './page/EditUser';
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
import EditClass from './page/EditClass';
import CreateClass from './page/CreateClass';
import FirstLogin from './page/Password/FirstLogin';
import ChangePassword from './page/Password/ChangePassword';
import ResetPassword from './page/Password/ResetPassword';
import Profile from './page/Profile';
import UpdateInformationUser from './page/UpdateInformationUser';
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
          <Route path="/profile" element={<Profile />} />
          <Route path="/updateinformationuser" element={<UpdateInformationUser />} />
          <Route path = "/createuser" element ={checkToken() ? <CreateUser/>: <Navigate to="/"/>  }/>
          <Route path="/detail-user/:id" element = {checkToken() ? <DetailUser/>: <Navigate to="/"/>}/>
          <Route path= "/update-user/:id" element = {checkToken() ? <UpdateUser/>: <Navigate to="/"/>}/>
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
          <Route path="/update-class/:id" element={checkToken() ? <EditClass /> : <Navigate to="/"/>}/>
          <Route path="/detail-class/:id" element={checkToken()? <EditClass /> : <Navigate to="/"/>}/>
          <Route path="/createclass" element={checkToken()? <CreateClass /> : <Navigate to="/"/>}/>
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
