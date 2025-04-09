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
import ManageBlog from './page/ManageBlog';
import CreateBLog from './page/CreateBlog';
import EditBlog from './page/EditBlog';
import BlogDetail from "./page/BlogDetail";
import CreateMeet from './page/CreateMeet';
import ManageClass from './page/ManageClass';
import EditClass from './page/EditClass';
import CreateClass from './page/CreateClass';
import DetailClass from './page/DetailClass';
import Major from "./page/Major";
import DetailMajor from "./page/DetailMajor";
import Document from './page/Document';
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
};

function getUserRole() {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.Role; // giả sử token chứa thuộc tính role
  } catch (error) {
    console.error("Token decode error:", error);
    return null;
  }
}

function isAdmin() {
  return getUserRole() === "admin";
}

function renderProtected(Component) {
  // Nếu không có token => chuyển hướng về trang login
  if (!checkToken()) return <Navigate to="/" />;
  // Nếu có token nhưng firstLogin === true => chuyển hướng về trang /firstlogin
  if (isFirstLogin()) return <Navigate to="/firstlogin" />;
  // Còn lại mới render component
  return <Component />;
}

function renderProtectedAdmin(Component) {
  // Nếu không có token => chuyển hướng về trang login
  if (!checkToken()) return <Navigate to="/" />;
  // Nếu có token nhưng firstLogin === true => chuyển hướng về trang /firstlogin
  if (isFirstLogin()) return <Navigate to="/firstlogin" />;
  // Kiểm tra vai trò admin
  if (!isAdmin()) return <Navigate to="/home" />;
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
          <Route path="/createuser" element={renderProtectedAdmin(CreateUser)} />
          <Route path="/detail-user/:id" element={renderProtectedAdmin(DetailUser)} />
          <Route path="/update-user/:id" element={renderProtectedAdmin(UpdateUser)} />
          <Route path="/manageuser" element={renderProtectedAdmin(ManageUser)} />
          <Route path="/major" element={renderProtectedAdmin(Major)} />
          <Route path="/detail-major/:id" element={renderProtectedAdmin(DetailMajor)} />
          <Route path="/home" element={renderProtected(Home)} />
          <Route path="/createblog" element={renderProtected(CreateBLog)} />
          <Route path="/editblog/:id" element={renderProtected(EditBlog)} />
          <Route path="/blogdetail/:id" element={renderProtected(BlogDetail)} />
          <Route path="/manageblog" element={renderProtectedAdmin(ManageBlog)} />
          <Route path="/subject" element={renderProtectedAdmin(Subject)} />
          <Route path="/manageclass" element={renderProtectedAdmin(ManageClass)} />
          <Route path="/document" element={renderProtected(Document)} />
          <Route path="/update-class/:classId" element={renderProtectedAdmin(EditClass)} />
          <Route path="/detail-class/:id" element={renderProtected(DetailClass)} />
          <Route path="/create-class" element={renderProtectedAdmin(CreateClass)} />
          <Route path="/schedule" element={renderProtected(Schedule)} />
          <Route path="/manageschedule" element={renderProtectedAdmin(ManageSchedule)} />
          <Route path="/dashboard" element={renderProtectedAdmin(Dashboard)} />
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
