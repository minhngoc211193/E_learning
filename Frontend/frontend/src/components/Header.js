import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import logo from "../assets/Greenwich.png";
import ProfileImg from "../assets/profile.jpg";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Notifications from '../page/Notification';
import axios from "axios";

function Header() {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // Trạng thái mở menu
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    // Khi resize màn hình, nếu lớn hơn 768px thì đóng menu
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setRole(res.data.Role);
    } catch (err) {
      console.error("Không thể lấy thông tin người dùng.");
    }
  };
  fetchUserInfo();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate('/');
  };
  const handleBellClick = () => {
    setIsNotificationOpen(prevState => !prevState);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftSection} onClick={() => navigate('/home')}>
        <img src={logo} alt="Logo" className={styles.elearning} />
      </div>

      {/* Thông tin người dùng */}
      <div className={styles.rightSection}>

        {/* Nút mở menu trên mobile */}
        <div className={styles.navToggle} onClick={() => setMenuOpen(!menuOpen)}>
          <i className="fa-solid fa-bars"></i>
        </div>

        {/* Thanh điều hướng */}
        <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
          {role === "admin" ? (
            <ul className={styles.navAdmin}>
              <li onClick={() => navigate('/dashboard')} className={styles.navItem}>Manage</li>
              <li onClick={() => navigate('/createblog')} className={styles.navItem}>Create blog</li>
            </ul>
          ) : (
            <ul className={styles.navUser}>
              <li onClick={() => navigate('/messenger')} className={styles.navItem}>Messenger</li>
              <li onClick={() => navigate('/manageclass')} className={styles.navItem}>Class</li>
              <li onClick={() => navigate('/schedule')} className={styles.navItem}>Schedule</li>
              <li onClick={() => navigate('/createblog')} className={styles.navItem}>Create blog</li>
              <li onClick={() => navigate('/managemeet')} className={styles.navItem}>Manage Meet</li>
            </ul>
          )}
        </nav>
        {/* Thông tin người dùng */}
        <div className={styles.notificationWrapper}>
          <div className={styles.notification} onClick={handleBellClick}>
            <i className="fa-regular fa-bell"></i>
          </div>
          {isNotificationOpen && (
            <div className={styles.notificationDropdown}>
              <Notifications />
            </div>
          )}
        </div>
        <div className={styles.userInfo} onClick={() => navigate('/profile')}>
          <img alt="avatar" src={image || ProfileImg} className={styles.avatar} />
          <span className={styles.username}>{fullname}</span>
        </div>
        <div>
          <span className={styles.logout} onClick={handleLogout}><i className="fa-solid fa-arrow-right-from-bracket"></i></span>
        </div>
      </div>
    </header>
  );
}

export default Header;
