import React, { useState, useEffect, useCallback } from "react";
import styles from "./Profile.module.css";
import BackgroundProfile from "../assets/background.png";
import ProfileImg from "../assets/profile.jpg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/Header";
import Menu from "../components/Menu";

function Profile() {
    const [image, setImage] = useState("");
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    const decoded = jwtDecode(token);
    const isAdmin = decoded.Role && decoded.Role.toLowerCase() === "admin";

    const fetchUserInfo = useCallback(async () => {
        try {
            if (!token) {
                console.error("You are not logged in!");
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200) {
                setImage(res.data.Image !== "N/A" ? res.data.Image : ProfileImg);
                setFullname(res.data.Fullname || "N/A");
                setEmail(res.data.Email || "N/A");
                setPhoneNumber(res.data.PhoneNumber || "N/A");
                setDateOfBirth(new Date(res.data.DateOfBirth).toLocaleDateString("vi-VN"));
                setGender(res.data.Gender || "N/A");
            }

            const resBlogs = await axios.get(`http://localhost:8000/blog/get-blog-by-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(resBlogs.data);
        } catch (err) {
            console.error("Cannot get information user or blog data.", err);
        }
    }, [token]);

    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    const handleEdit = (id) => {
        navigate(`/editblog/${id}`);
    };

    const handleDelete = async (blogId, e) => {
        e.stopPropagation();

        const result = await Swal.fire({
            title: "Do you want to delete this blog?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem("accessToken");
            await axios.delete(`http://localhost:8000/blog/delete-blog/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire("Delete!", "Blog has been delete.", "success");
            fetchUserInfo();
        } catch (error) {
            console.error("Error when delete blog", error);
            Swal.fire("Error!", "Cannot delete blog.", "error");
        }
    };

    return (
        <div className={isAdmin ? styles.main : styles.main2}>
            {isAdmin ? (<> <Menu /></>) : (<Header />)}
            <div className={styles.container}>
                <img src={BackgroundProfile} alt="User Cover" className={styles.coverImage} />
                <div className={styles.profileContainer}>
                    <img src={image || ProfileImg} alt="User Profile" className={styles.profileImage} />
                </div>

                <div className={styles.infoContainer}>
                    <h1 className={styles.fullName}>{fullname}</h1>
                    <p className={styles.about}>
                        <i className="fa-solid fa-envelope"></i> Email: {email}
                    </p>
                    <p className={styles.about}>
                        <i className="fa-solid fa-phone"></i> Phone number: +84{phoneNumber}
                    </p>
                    <p className={styles.about}>
                        <i className="fa-solid fa-cake-candles"></i> Date of birth: {dateOfBirth}
                    </p>
                    <p className={styles.about}>
                        <i className="fa-solid fa-venus-mars"></i> Gender: {gender}
                    </p>
                    <button onClick={() => navigate('/updateinformationuser')} className={styles.btnEdit}>
                        <i className="fa-solid fa-pen"></i> Detail profile
                    </button>
                    <div className={styles.cardsContainer}>
                        {blogs.length > 0 ? (
                            blogs.map((blog) => (
                                <div key={blog._id} className={styles.blogCard} onClick={() => handleEdit(blog._id)}>
                                    <i class="fa-solid fa-trash" onClick={(e) => handleDelete(blog._id, e)}></i>
                                    {blog.Image && (
                                        <img
                                            src={blog.Image}
                                            alt={blog.Title}
                                            className={styles.blogImage}
                                        />
                                    )}
                                    <div className={styles.blogContent}>
                                        <h3 className={styles.blogTitle}>{blog.Title}</h3>
                                        <p className={styles.blogContent}>
                                            {blog.Content.length > 100 ? blog.Content.substring(0, 100) + "..." : blog.Content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.blogCardNone}>
                                <p>No blog yet</p> <br />
                                <button onClick={() => navigate('/createblog')}>
                                    <i className="fa-solid fa-pen"></i> Create blog
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
