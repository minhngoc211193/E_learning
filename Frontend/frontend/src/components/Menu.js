import React, {useState, useEffect} from 'react';
import styles from './Menu.module.css';
import {jwtDecode} from "jwt-decode";
import { useNavigate } from 'react-router-dom';

function Menu() {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
          try {
            const decoded = jwtDecode(token);
            setUserRole(decoded.Role);
          } catch (error) {
            console.error("Lỗi giải mã token", error);
          }
        }
      }, []);

    const handleOpenMenu = () => {
        setisOpenMenu(true);
    };
    const handleCloseMenu = () => {
        setisOpenMenu(false);
    };
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        window.location.href = "/";
    };
    return (
        <div>
            <div className={isOpenMenu ? styles.hiddenBackground : styles.hiddenMenu}>
                <div className={styles.hiddenMain}>
                    <div className={styles.button}>
                        <button onClick={handleCloseMenu} className={styles.buttonCloseMenu}><i className="fa-solid fa-caret-right"></i></button>
                    </div>
                    <div className={styles.menu}>
                        <div className={styles.menuTop}>
                            <span><i className="fa-solid fa-user"></i></span>
                            <h2>User Name</h2>
                            <p>Role</p>
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
                            <div onClick={() => navigate('/manageaccount')} className={styles.option}><span>Manage account</span></div>
                            <div onClick={() => navigate('/createuser')} className={styles.option}><span>Create user</span></div>
                            </>
                            )}
                        </div>
                        <div className={styles.logout}>
                            <span onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i></span>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={handleOpenMenu} className={isOpenMenu ? styles.hiddenFixedButtonMenu : styles.fixedButtonMenu}><i className="fa-solid fa-caret-left"></i></button>
        </div>
    )
}

export default Menu;