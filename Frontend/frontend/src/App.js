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
<<<<<<< HEAD
=======
import CreateMeet from './page/CreateMeet';

>>>>>>> 5b4d772a32245fd54b3ede247d2c8d43914127f8
import ManageClass from './page/ManageClass';
import Major from "./page/Major";
import Document from './page/Document';
import EditClass from './page/EditClass';
import DetailClass from './page/DetailClass';
import CreateClass from './page/CreateClass';
import FirstLogin from './page/Password/FirstLogin';
import ChangePassword from './page/Password/ChangePassword';
import ResetPassword from './page/Password/ResetPassword';
import Profile from './page/Profile';
import UpdateInformationUser from './page/UpdateInformationUser';
<<<<<<< HEAD
import Schedule from './page/Schedule';
import ManageSchedule from './page/ManageSchedule';
import Dashboard from './page/Dashboard';
import Attendance from './page/Attendance';
=======
import Messenger from './page/Messenger';
import ManageMeet from './page/ManageMeet';
import Notification from './page/Notification';
>>>>>>> 5b4d772a32245fd54b3ede247d2c8d43914127f8
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
<<<<<<< HEAD
          <Route path="/firstlogin" element={
              checkToken() 
                ? (isFirstLogin() ? <FirstLogin /> : <Navigate to="/home" />)
                : <Navigate to="/" />
            } />
          <Route path="/changepassword" element={renderProtected(ChangePassword)} />
          <Route path="/resetpassword" element={renderProtected(ResetPassword)} />
          <Route path="/profile" element={renderProtected(Profile)} />
          <Route path="/updateinformationuser" element={renderProtected(UpdateInformationUser)} />
          <Route path="/createuser" element={renderProtected(CreateUser)} />
          <Route path="/detail-user/:id" element={renderProtected(DetailUser)} />
          <Route path="/update-user/:id" element={renderProtected(UpdateUser)} />
          <Route path="/manageuser" element={renderProtected(ManageUser)} />
          <Route path="/major" element={renderProtected(Major)} />
          <Route path="/home" element={renderProtected(Home)} />
          <Route path="/createblog" element={renderProtected(CreateBLog)} />
          <Route path="/editblog/:id" element={renderProtected(EditBlog)} />
          <Route path="/blogdetail/:id" element={renderProtected(BlogDetail)} />
          <Route path="/manageblog" element={renderProtected(ManageBlog)} />
          <Route path="/subject" element={renderProtected(Subject)} />
          <Route path="/manageclass" element={renderProtected(ManageClass)} />
          <Route path="/document" element={renderProtected(Document)} />
          <Route path="/update-class/:id" element={renderProtected(EditClass)} />
          <Route path="/detail-class/:id" element={renderProtected(EditClass)} />
          <Route path="/createclass" element={renderProtected(CreateClass)} />
          <Route path="/schedule" element={renderProtected(Schedule)} />
          <Route path="/manageschedule" element={renderProtected(ManageSchedule)} />
          <Route path="/dashboard" element={renderProtected(Dashboard)} />
          <Route path="/attendance/:scheduleId" element={renderProtected(Attendance)} />
=======
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
          <Route path="/update-class/:classId" element={checkToken() ? <EditClass /> : <Navigate to="/"/>}/>
          <Route path="/detail-class/:id" element={checkToken()? <DetailClass /> : <Navigate to="/"/>}/>
          <Route path="/create-class" element={checkToken()? <CreateClass /> : <Navigate to="/"/>}/>
          <Route path ="/messenger" element = {checkToken()? <Messenger /> : <Navigate to="/"/>}/>
          <Route path="/createmeeting" element={checkToken()? <CreateMeet/> : <Navigate to="/"/>}/>
          <Route path ="/managemeet" element= {checkToken()? <ManageMeet/> : <Navigate to="/"/>}/>
          <Route path="/noti" element={checkToken()? <Notification/> : <Navigate to="/"/>}/>
>>>>>>> 5b4d772a32245fd54b3ede247d2c8d43914127f8
        </Routes>
      </div>
    </Router>
  );
}

export default App;
