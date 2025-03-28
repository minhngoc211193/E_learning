import React, { useState } from 'react';
import styles from './Menu.module.css';
import Logo from "../assets/Greenwich.png";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Menu() {
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
      navigate('/');
    };

    return (
<<<<<<< HEAD
        <div className={styles.sidebar}>
            <div className={styles.top}>
                <img src={Logo} alt="Logo" className={styles.logo} />
                <div className={styles.menu}>
                    <a href="/dashboard"><i className="fa-solid fa-desktop" style={{ color: "rgb(62, 149, 255)" }}></i> Dashboard</a>
                    <a href="/manageclass"><i class="fa-solid fa-book" style={{ color: "rgb(255, 113, 47)" }}></i> Manage class</a>
                    <a href="/manageschedule"><i class="fa-regular fa-calendar-days" style={{ color: "rgb(0, 242, 255)" }}></i> Manage schedule</a>
                    <a href="/manageblog"><i class="fa-solid fa-blog" style={{ color: "rgb(250, 183, 0)" }}></i> Manage blog</a>
                    <a href="/manageuser"><i class="fa-solid fa-users" style={{ color: "rgb(0, 0, 0)" }}></i> Manage user</a>
                    <a href="/managesubject"><i class="fa-solid fa-calculator" style={{ color: "rgb(0, 172, 77)" }}></i> Manage subject</a>
                    <a href="/managemajor"><i class="fa-solid fa-school" style={{ color: "rgb(155, 0, 140)" }}></i> Manage major</a>
=======
        <div>
            <div className={`${styles.hiddenBackground} ${isOpenMenu ? styles.isOpenBackground : ''}`}>
                <div className={`${styles.hiddenMain} ${isOpenMenu ? styles.isOpen : ''}`} onClick={handleCloseMenu}>
                    <div className={styles.button}>
                        <button onClick={handleCloseMenu} className={styles.buttonCloseMenu}><i className="fa-solid fa-caret-right"></i></button>
                    </div>
                    <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.menuTop}>
                            <h2>{fullname}</h2>
                            <p>{userRole}</p>
                        </div>
                        <div className={styles.menuBottom}>
                            {/* Các option chung */}
                            <div onClick={() => navigate('/profile')} className={styles.option}><span>Profile</span></div>
                            {/* Các option cho student và teacher */}
                            {(userRole === "student" || userRole === "teacher") && (
                                <>
                                    <div onClick={() => navigate('/dashboard')} className={styles.option}><span>Dashboard</span></div>
                                    <div onClick={() => navigate('/myclass')} className={styles.option}><span>My class</span></div>
                                    <div onClick={() => navigate('/myschedule')} className={styles.option}><span>My schedule</span></div>
                                    <div onClick={() => navigate('/createblog')} className={styles.option}><span>Create blog</span></div>
                                </>
                            )}
                            {/* Các option cho admin */}
                            {userRole === "admin" && (
                                <>
                                    <div onClick={() => navigate('/managedashboard')} className={styles.option}><span>Manage dashboard</span></div>
                                    <div onClick={() => navigate('/manageclass')} className={styles.option}><span>Manage class </span></div>
                                    <div onClick={() => navigate('/manageschedule')} className={styles.option}><span>Manage schedule</span></div>
                                    <div onClick={() => navigate('/manageblog')} className={styles.option}><span>Manage blog</span></div>
                                    <div onClick={() => navigate('/manageuser')} className={styles.option}><span>Manage User</span></div>
                                    <div onClick={() => navigate('/managesubject')} className={styles.option}><span>Manage subject</span></div>
                                    <div onClick={() => navigate('/managemajor')} className={styles.option}><span>Manage major</span></div>
                                </>
                            )}
                        </div>
                        <div className={styles.logout}>
                            <span onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i></span>
                        </div>
                    </div>
>>>>>>> 5b4d772a32245fd54b3ede247d2c8d43914127f8
                </div>
            </div>
            <div className={styles.bottom}>
                <div className={styles.user} onClick={() => navigate("/profile")}>
                    <img src={image} alt="User" className={styles.userImage} />
                    <span className={styles.userName}>{fullname}</span>
                </div>
                <div className={styles.logout} onClick={handleLogout}><i class="fa-solid fa-right-from-bracket" style={{ color: "rgb(0, 0, 0)" }}></i> Log out</div>
            </div>
        </div>
    )
}

export default Menu;