import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import styles from "./UpdateInformationUser.module.css";
import BackgroundProfile from "../assets/profile.jpg";
import ProfileImg from "../assets/profile.jpg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Menu from '../components/Menu';

function UpdateInformation() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        image: "",
        fullname: "",
        username: "",
        email: "",
        role: "",
        phoneNumber: "",
        dateOfBirth: "",
        major: "",
        gender: "",
        schoolYear: ""
    });

    const token = localStorage.getItem("accessToken");
    const decoded = jwtDecode(token);
    const isAdmin = decoded.Role && decoded.Role.toLowerCase() === "admin";

    const fetchUserInfo = useCallback(async () => { /* Wrapped in useCallback */
        if (!token) {
            console.error("You are not logged in!");
            return;
        }
        try {
            const userId = decoded.id;
            const res = await axios.get(`https://e-learning-backend-fsih.onrender.com/user/detail-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200) {
                setUserData({
                    image: res.data.Image || ProfileImg,
                    fullname: res.data.Fullname || "",
                    username: res.data.Username || "",
                    email: res.data.Email || "",
                    role: res.data.Role || "",
                    phoneNumber: res.data.PhoneNumber || "",
                    dateOfBirth: new Date(res.data.DateOfBirth).toISOString().split('T')[0],
                    major: res.data.Major || "",
                    gender: res.data.Gender || "",
                    schoolYear: res.data.SchoolYear || ""
                });
            }
        } catch (err) {
            console.error("Cannot get user information.", err);
        }
    }, [token, decoded.id]); // Added dependencies

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]); // Added fetchUserInfo as dependency

    return (
        <div className={styles.detailInfor}>
            {isAdmin ? (<> <Menu /></>) : null}
            <div className={isAdmin ? styles.body : styles.body2}>
                <div className={isAdmin ? styles.backButtonHidden : styles.backButton} onClick={() => navigate("/profile")}>
                    <span><i className="fa-solid fa-arrow-left"></i></span>
                </div>
                <div className={styles.profile}>
                    <img src={userData.image || BackgroundProfile} alt="User Profile" className={styles.profileImage} />
                    <h2>{userData.fullname}</h2>
                    <h2>{userData.role}</h2>
                </div>
                <div className={styles.main}>
                    <form>
                        <h1 className={styles.heading}>Profile Detail</h1>
                        <div className={styles.mainForm}>
                            <div className={styles.formLeft}>
                                <label>Full name</label>
                                <input type="text" name="fullname" value={userData.fullname} readOnly />

                                <label>Email</label>
                                <input type="email" name="email" value={userData.email} readOnly />

                                <label>Role</label>
                                <input type="text" name="role" value={userData.role} readOnly />

                                <label>Date of birth</label>
                                <input type="date" name="dateOfBirth" value={userData.dateOfBirth} readOnly />

                                <label>School Year</label>
                                <input type="text" name="schoolYear" value={userData.schoolYear} readOnly />
                            </div>

                            <div className={styles.formRight}>
                                <label>User name</label>
                                <input type="text" name="username" value={userData.username} readOnly />

                                <label>Phone number</label>
                                <input type="text" name="phoneNumber" value={userData.phoneNumber} readOnly />

                                <label>Major</label>
                                <input type="text" name="major" value={userData.major.Name} readOnly />

                                <label>Gender</label>
                                <input type="text" name="gender" value={userData.gender} readOnly />

                                <label>Password</label> <br />
                                <button className={styles.changePassword} onClick={() => navigate('/changepassword')}>
                                    <i className="fa-solid fa-key"></i> Change Password
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default UpdateInformation;
