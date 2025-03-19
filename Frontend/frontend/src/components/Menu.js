import React, { useState, useEffect } from 'react';
import styles from './Menu.module.css';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function Menu() {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState("");
    const [fullname, setFullname] = useState("");

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
            setUserRole(res.data.Role);
        } catch (err) {
            console.error("Không thể lấy thông tin người dùng.");
        }
    };
    fetchUserInfo();

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
                                    <div onClick={() => navigate('/manageaccount')} className={styles.option}><span>Manage account</span></div>
                                    <div onClick={() => navigate('/managesubject')} className={styles.option}><span>Manage subject</span></div>
                                    <div onClick={() => navigate('/managemajor')} className={styles.option}><span>Manage major</span></div>
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