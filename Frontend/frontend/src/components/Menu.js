import React, {useState} from 'react'
import styles from './Menu.module.css'
import { useNavigate } from 'react-router-dom';

function Menu() {
    const [isOpenMenu, setisOpenMenu] = useState(false);
    const navigate = useNavigate();

    const handleOpenMenu = () => {
        setisOpenMenu(true);
        console.log(isOpenMenu)
    };
    const handleCloseMenu = () => {
        setisOpenMenu(false);
        console.log(isOpenMenu)
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
                        <button onClick={handleCloseMenu} className={styles.buttonCloseMenu}><i class="fa-solid fa-caret-right"></i></button>
                    </div>
                    <div className={styles.menu}>
                        <div className={styles.menuTop}>
                            <span><i class="fa-solid fa-user"></i></span>
                            <h2>User Name</h2>
                            <p>Role</p>
                        </div>
                        <div className={styles.menuBottom}>
                            <div onClick={() => navigate('/profile')} className={styles.option}><span>Profile</span></div>
                            <div onClick={() => navigate('/dashboard')} className={styles.option}><span>Dashboard</span></div>
                            <div onClick={() => navigate('/myClass')} className={styles.option}><span>My class</span></div>
                            <div onClick={() => navigate('/myschedule')} className={styles.option}><span>My schedule</span></div>
                            <div onClick={() => navigate('/createBlog')} className={styles.option}><span>Create blog</span></div>
                        </div>
                        <div className={styles.logout}>
                            <span onClick={handleLogout}><i class="fa-solid fa-right-from-bracket"></i></span>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={handleOpenMenu} className={isOpenMenu ? styles.hiddenFixedButtonMenu : styles.fixedButtonMenu}><i class="fa-solid fa-caret-left"></i></button>
        </div>
    )
}

export default Menu;