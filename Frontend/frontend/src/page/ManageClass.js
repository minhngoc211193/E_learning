import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import styles from './ManageClass.module.css';
import Menu from "../components/Menu";
import Header from '../components/Header';
import { notification } from "antd";
function ManageClass() {
    const [classes, setClasses] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const decoded = jwtDecode(token);
    const userId = decoded.id;
    const role = decoded.Role;
    const [api, contextHolder] = notification.useNotification();
        
    const openNotification = (type, detailMessage = "") => {
        if (type === "success") {
            api.open({
                message: "Action uccessfully!",
                description: "Your action has been successfully.",
                showProgress: true,
                pauseOnHover: true,
            });
        } else {
            api.open({
                message: "Failed!",
                description: detailMessage,
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };
    useEffect(() => {
        if (role === "admin") {
            fetchClasses();
        } else {
            fetchClassesByUser();
        }
    }, [role]);

    //  Get class by user: fetch class theo user. 
    const fetchClasses = async () => {
        try {
            const response = await axios.get("http://localhost:8000/class/classes", {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(response.data);
            setClasses(response.data);
        } catch (e) {
            console.error("Error fetching classes", e);
        }
    }
    const fetchClassesByUser = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/class/class-by-userId/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
        } catch (e) {
            console.error("Error fetching user classes", e);
        }
    };
    const filteredClasses = classes.filter(classItem =>
        classItem.Classname.toLowerCase().includes(search.toLowerCase())
    );
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };
    const handleClass = (id) => {

        navigate(`/detail-class/${id}`);


    };
    const handleDelete = async (id) => {
        const token = localStorage.getItem("accessToken");
        if (!window.confirm("Are you sure you want to delete this class?"))
            return;
        try {
            await axios.delete(`http://localhost:8000/class/delete-class/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(classes.filter(classItem => classItem._id !== id));
        } catch (e) {
            console.error("Error deleting class", e);
            const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };

    return (
        <div className={role === "admin" ? styles.body : styles.body1}>
            {contextHolder}
            {role === "admin" ? <Menu /> : <Header />}
            <div className={role === "admin" ? styles.containerAdmin : styles["main-content"]}>
                <div className={styles.header}>
                    <h1 className={styles.title}>All Class</h1>
                    {role === "admin" && (
                        <button className={styles["create-btn"]}
                            onClick={() => navigate("/create-class")}
                        >
                            Create new class
                        </button>
                    )}
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Enter here..."
                        value={search}
                        onChange={handleSearch}
                        className={styles["search-bar"]}
                    />
                </div>
                <div className={styles["class-grid"]}>
                    {filteredClasses.map((classItem) => (
                        <div key={classItem._id} className={styles["class-card"]} onClick={() => handleClass(classItem._id)}>
                            <h2 className={styles["class-title"]}>{classItem.Classname}</h2>
                            <p>{classItem.Subject?.Name}</p>

                            <div className="avatar">
                                <span>Teacher: {classItem.Teacher.Fullname}</span>
                            </div>

                            {role === 'admin' && (
                                <div className={styles["admin-actions"]}>
                                    <button
                                        className={styles["edit-btn"]}
                                        onClick={(e) => {navigate(`/update-class/${classItem._id}`); e.stopPropagation();}}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className={styles["delete-btn"]}
                                        onClick={(e) => {handleDelete(classItem._id); e.stopPropagation();}}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                        </div>
                    ))}
                </div>
            </div>
        </div>

    );

}
export default ManageClass;