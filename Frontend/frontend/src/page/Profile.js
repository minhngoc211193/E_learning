import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import BackgroundProfile from "../assets/background.png";
import ProfileImg from "../assets/profile.jpg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import BackButton from "../components/BackButton";

function Profile() {
    const [image, setImage] = useState("");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    console.error("Bạn chưa đăng nhập!");
                    return;
                }
                const decoded = jwtDecode(token);
                const userId = decoded.id;
                const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
                    headers: { Authorization: `Bearer ${token}`, "Cache-Control": "no-cache" }
                });

                if (res.status === 200) {
                    setImage(res.data.Image !== "N/A" ? res.data.Image : ProfileImg);
                    setFullname(res.data.Fullname || "N/A");
                    setEmail(res.data.Email || "N/A");
                    setPhoneNumber(res.data.PhoneNumber || "N/A");
                    setDateOfBirth(new Date(res.data.DateOfBirth).toLocaleDateString("vi-VN"));
                    setGender(res.data.Gender || "N/A");
                }
            } catch (err) {
                console.error("Không thể lấy thông tin người dùng.", err);
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <div className={styles.container}>
            <BackButton />
            <img src={BackgroundProfile} alt="User Cover" className={styles.coverImage} />
            <div className={styles.profileContainer}>
                <img src={image || ProfileImg} alt="User Profile" className={styles.profileImage} />
            </div>

            <div className={styles.infoContainer}>
                <h1 className={styles.fullName}>{fullname}</h1>
                <p className={styles.about}><i className="fa-solid fa-envelope"></i> Email: {email}</p>
                <p className={styles.about}><i className="fa-solid fa-phone"></i> Phone number: {phoneNumber}</p>
                <p className={styles.about}><i className="fa-solid fa-cake-candles"></i> Date of birth: {dateOfBirth}</p>
                <p className={styles.about}><i className="fa-solid fa-venus-mars"></i> Gender: {gender}</p>
                <button onClick={() => navigate('/updateinformationuser')} className={styles.btnEdit}>
                    <i className="fa-solid fa-pen"></i> Detail profile
                </button>
                <div className={styles.cardsContainer}>
                    <div className={styles.card}>Blog</div>
                    <div className={styles.card}>Blog</div>
                    <div className={styles.card}>Blog</div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
