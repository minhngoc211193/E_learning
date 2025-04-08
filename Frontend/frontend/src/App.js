import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import CreateUser from "./page/User/CreateUser";
import DetailUser  from './page/DetailUser';
import UpdateUser from './page/EditUser';
import ManageUser from "./page/ManageUser";
import Login from "./page/Login";
import Home from "./page/Home";
import Subject from "./page/Subject";
import CreateBLog from './page/CreateBlog';
import EditBlog from './page/EditBlog';
import BlogDetail from "./page/BlogDetail";
import ManageBlog from './page/ManageBlog';
import CreateMeet from './page/CreateMeet';
import ManageClass from './page/ManageClass';
import Major from "./page/Major";
import DetailMajor from "./page/DetailMajor";
import Document from './page/Document';
import EditClass from './page/EditClass';
import DetailClass from './page/DetailClass';
import CreateClass from './page/CreateClass';
import FirstLogin from './page/Password/FirstLogin';
import ChangePassword from './page/Password/ChangePassword';
import ResetPassword from './page/Password/ResetPassword';
import Profile from './page/Profile';
import UpdateInformationUser from './page/UpdateInformationUser';
import Schedule from './page/Schedule';
import ManageSchedule from './page/ManageSchedule';
import Dashboard from './page/Dashboard';
import Attendance from './page/Attendance';
import Messenger from './page/Messenger';
import ManageMeet from './page/ManageMeet';
import Notification from './page/Notification';


import './App.css';

function checkToken() {
  const token = localStorage.getItem("accessToken");
  return token ? true : false;
}

function isFirstLogin() {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  try {
    const decoded = jwtDecode(token);
    return decoded.firstLogin;
  } catch (error) {
    console.error("Token decode error:", error);
    return false;
  }
}

function renderProtected(Component) {
  // Nếu không có token => chuyển hướng về trang login
  if (!checkToken()) return <Navigate to="/" />;
  // Nếu có token nhưng firstLogin === true => chuyển hướng về trang /firstlogin
  if (isFirstLogin()) return <Navigate to="/firstlogin" />;
  // Còn lại mới render component
  return <Component />;
}

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/firstlogin" element={
              checkToken() 
                ? (isFirstLogin() ? <FirstLogin /> : <Navigate to="/home" />)
                : <Navigate to="/" />
            } />
          <Route path="/changepassword" element={renderProtected(ChangePassword)} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/profile" element={renderProtected(Profile)} />
          <Route path="/updateinformationuser" element={renderProtected(UpdateInformationUser)} />
          <Route path="/createuser" element={renderProtected(CreateUser)} />
          <Route path="/detail-user/:id" element={renderProtected(DetailUser)} />
          <Route path="/update-user/:id" element={renderProtected(UpdateUser)} />
          <Route path="/manageuser" element={renderProtected(ManageUser)} />
          <Route path="/major" element={renderProtected(Major)} />
          <Route path="/detail-major/:id" element={renderProtected(DetailMajor)} />
          <Route path="/home" element={renderProtected(Home)} />
          <Route path="/createblog" element={renderProtected(CreateBLog)} />
          <Route path="/editblog/:id" element={renderProtected(EditBlog)} />
          <Route path="/blogdetail/:id" element={renderProtected(BlogDetail)} />
          <Route path="/manageblog" element={renderProtected(ManageBlog)} />
          <Route path="/subject" element={renderProtected(Subject)} />
          <Route path="/manageclass" element={renderProtected(ManageClass)} />
          <Route path="/document" element={renderProtected(Document)} />
          <Route path="/update-class/:classId" element={renderProtected(EditClass)} />
          <Route path="/detail-class/:classId" element={renderProtected(DetailClass)} />
          <Route path="/create-class" element={renderProtected(CreateClass)} />
          <Route path="/schedule" element={renderProtected(Schedule)} />
          <Route path="/manageschedule" element={renderProtected(ManageSchedule)} />
          <Route path="/dashboard" element={renderProtected(Dashboard)} />
          <Route path="/attendance/:scheduleId" element={renderProtected(Attendance)} />
          <Route path="/detail-class/:id" element={renderProtected(DetailClass)} />
          <Route path ="/messenger" element = {renderProtected(Messenger)} />
          <Route path="/createmeeting" element={renderProtected(CreateMeet)} />
          <Route path ="/managemeet" element= {renderProtected(ManageMeet)} />
          <Route path="/noti" element={renderProtected(Notification)} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
