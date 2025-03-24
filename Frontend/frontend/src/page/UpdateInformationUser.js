import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "./UpdateInformationUser.module.css";
import ProfileImg from "../assets/profile.jpg";
import { jwtDecode } from "jwt-decode";
import BackButton from '../components/BackButton';
import { useNavigate } from 'react-router-dom';

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

    useEffect(() => {
        fetchUserInfo();
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
            console.error("Không thể lấy thông tin người dùng.", err);
        }
    };

    return (
        <div className={styles.body}>
            <BackButton />
            <div className={styles.profile}>
                <img src={userData.image || ProfileImg} alt="User Profile" className={styles.profileImage} />
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

                            <label>Password</label>
                            <button className={styles.changePassword} onClick={() => navigate('/changepassword')}>
                                <i class="fa-solid fa-key"></i> Change Password
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default UpdateInformation;
