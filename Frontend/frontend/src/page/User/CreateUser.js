import React, { useState, useEffect } from 'react';
import styles from '../User/CreateUser.module.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { notification } from 'antd';

function CreateUser({ setActiveTab }) {
    const [majors, setMajors] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const [api, contextHolder] = notification.useNotification();
    
        const openNotification = (type, detailMessage = "") => {
            if (type === "success") {
                api.open({
                    message: "Action successful!",
                    description: "Create new user successful.",
                    showProgress: true,
                    pauseOnHover: true,
                });
            } else {
                api.open({
                    message: "Action failed!",
                    description: detailMessage,
                    showProgress: true,
                    pauseOnHover: true,
                });
            }
        };

    useEffect(() => {
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1])); 
                if (decodedToken.Role !== "admin") {
                    alert("You have to login!");
                    navigate("/home"); 
                }
            } catch (err) {
                console.error("Token không hợp lệ", err);
                navigate("/"); 
            }
        } else {
            alert("You should login!");
            navigate("/home");
        }
    }, [navigate]);

    useEffect(() => {
        const decoded = jwtDecode(token);
        const userRole = decoded?.role;

        const fetchMajors = async () => {
            try {
                const response = await axios.get("http://localhost:8000/major/majors", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMajors(response.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchMajors();
    }, []);

    const [userData, setUserData] = useState({
        Fullname: "",  
        Username: "",  
        SchoolYear: "",  
        Email: "",     
        PhoneNumber: "", 
        Role: "",   
        Gender: "",   
        DateOfBirth: "",
        MajorId: "",

    });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        console.log("Form submitted!", userData); 
        try {
            const response = await axios.post("http://localhost:8000/auth/register", userData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });
            setUserData({
                Fullname: "",  
                Username: "",  
                SchoolYear: "",  
                Email: "",     
                PhoneNumber: "", 
                Role: "",   
                Gender: "",   
                DateOfBirth: "",
                MajorId: "",
            });

            openNotification("success");
            setTimeout(() => setActiveTab("all"),2000);
        } catch (e) {
            const errorMessage =
                e.response?.data?.message || "Have problem, please try again!";
            openNotification("error", errorMessage);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            {contextHolder}
            <div className={styles.modalContent}>
                <button className={styles.closeButton} onClick={() => setActiveTab("all")}>
                    ✖
                </button>

                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h1 className={styles.title}>Create Account</h1>

                        <div className={styles.formGrid}>
                            <input type="text" name="Fullname" placeholder="Full Name" value={userData.Fullname} onChange={handleChange} className={styles.input} required />
                            <input type="email" name="Email" placeholder="Email" value={userData.Email} onChange={handleChange} className={styles.input} required />
                            <input type="tel" name="PhoneNumber" placeholder="Phone Number" value={userData.PhoneNumber} onChange={handleChange} className={styles.input} required />
                            <select name="Role" value={userData.Role} onChange={handleChange} className={styles.Select} required>
                                <option value="">Select Role</option>
                                <option value="admin">Admin</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>

                            {userData.Role === "student" || userData.Role === "teacher" ? (
                                <select name="MajorId" value={userData.MajorId || ""} onChange={handleChange} className={styles.Select} required>
                                    <option value="">Select Major</option>
                                    {majors.map((major) => (
                                        <option key={major._id} value={major._id}>{major.Name}</option>
                                    ))}
                                </select>
                            ) : null}

                            {userData.Role === "student" && (
                                <input type="number" name="SchoolYear" placeholder="SchoolYear" value={userData.SchoolYear} onChange={handleChange} className={styles.input} />
                            )}

                            <select name="Gender" value={userData.Gender} onChange={handleChange} className={styles.Select} required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>

                            <input type="date" name="DateOfBirth" value={userData.DateOfBirth} onChange={handleChange} className={styles.Select} required />
                        </div>

                        <button type="submit" onClick={handleSubmit} className={styles.Create}>Create New User</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateUser;
