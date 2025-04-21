import React, { useState } from 'react';
import styles from './Menu.module.css';
import Logo from "../assets/Greenwich.png";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import ProfileImg from "../assets/profile.jpg";

function Menu() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [image, setImage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Bạn chưa đăng nhập!");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const res = await axios.get(`https://e-learning-backend-fsih.onrender.com/user/detail-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFullname(res.data.Fullname);
      setImage(res.data.Image);
    } catch (err) {
      console.error("Không thể lấy thông tin người dùng.");
    }
  };
  fetchUserInfo();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate('/');
  };

  const toggleMenu = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.toggleBtn}>
        {isCollapsed 
          ? <i onClick={toggleMenu} className="fa-solid fa-greater-than"></i>  // btnOpen
          : <i onClick={toggleMenu} className="fa-solid fa-less-than"></i>      // btnClose
        }
      </div>
      <div className={styles.top}>
        {/* Ẩn logo khi menu bị collapse */}
        {!isCollapsed && (
          <img src={Logo} alt="Logo" className={styles.logo} onClick={() => navigate('/home')} />
        )}
        <div className={styles.menu}>
          <a href="/dashboard">
            <i className="fa-solid fa-desktop" style={{ color: "rgb(62, 149, 255)" }}></i>
            {!isCollapsed && " Dashboard"}
          </a>
          <a href="/manageclass">
            <i className="fa-solid fa-book" style={{ color: "rgb(255, 113, 47)" }}></i>
            {!isCollapsed && " Manage class"}
          </a>
          <a href="/manageschedule">
            <i className="fa-regular fa-calendar-days" style={{ color: "rgb(0, 242, 255)" }}></i>
            {!isCollapsed && " Manage schedule"}
          </a>
          <a href="/manageblog">
            <i className="fa-solid fa-blog" style={{ color: "rgb(250, 183, 0)" }}></i>
            {!isCollapsed && " Manage blog"}
          </a>
          <a href="/manageuser">
            <i className="fa-solid fa-users" style={{ color: "rgb(0, 0, 0)" }}></i>
            {!isCollapsed && " Manage user"}
          </a>
          <a href="/subject">
            <i className="fa-solid fa-calculator" style={{ color: "rgb(0, 172, 77)" }}></i>
            {!isCollapsed && " Manage subject"}
          </a>
          <a href="/major">
            <i className="fa-solid fa-school" style={{ color: "rgb(155, 0, 140)" }}></i>
            {!isCollapsed && " Manage major"}
          </a>
        </div>
      </div>
      <div className={styles.bottom}>
        <div className={styles.user} onClick={() => navigate("/profile")}>
          <img src={image || ProfileImg} alt="User" className={styles.userImage} />
          {!isCollapsed && <span className={styles.userName}>{fullname}</span>}
        </div>
        <div className={styles.logout} onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket" style={{ color: "rgb(0, 0, 0)" }}></i>
          {!isCollapsed && " Log out"}
        </div>
      </div>
    </div>
  )
}

export default Menu;
