import React, { useState } from 'react';
import styles from './Header.module.css';
import logo from "../assets/Greenwich.png";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Header() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [image, setImage] = useState("");

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Bạn chưa đăng nhập!");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
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
    window.location.href = "/";
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection} onClick={() => navigate('/home')}>
        <img src={logo} alt="Logo" className={styles.elearning} />
      </div>
      <div className={styles.rightSection}>
        <nav className={styles.nav}>
          <ul>
            <li onClick={() => navigate('/dashboard')} className={styles.navItem}>Dashboard</li>
            <li onClick={() => navigate('/myclass')} className={styles.navItem}>Class</li>
            <li onClick={() => navigate('/schedule')} className={styles.navItem}>Schedule</li>
            <li onClick={() => navigate('/createblog')} className={styles.navItem}>Create blog</li>
          </ul>
        </nav>
        {/* Thông tin người dùng */}
        <div className={styles.notification}>
          <i class="fa-regular fa-bell"></i>
        </div>
        <div className={styles.userInfo} onClick={() => navigate('/profile')}>
          <img alt="avatar" src={image} className={styles.avatar} />
          <span className={styles.username}>{fullname}</span>
        </div>
        <div>
          <span className={styles.logout} onClick={handleLogout}><i class="fa-solid fa-arrow-right-from-bracket"></i></span>
        </div>
      </div>
    </header>
  );
}

export default Header;
