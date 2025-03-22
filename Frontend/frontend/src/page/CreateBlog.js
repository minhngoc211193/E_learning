import React, { useState } from "react";
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import styles from "./CreateBlog.module.css";
import backgroundImg from '../assets/abc.jpg';

function CreateBlog() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Kiểm tra dữ liệu trước khi gửi
        if (!title.trim() || !content.trim() || !image.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            // Lấy token từ localStorage
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                return;
            }

            // Giải mã token để lấy userId
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            // Gửi request tạo bài viết
            const res = await axios.post(
                "http://localhost:8000/blog/create-blog",
                { Title: title, Content: content, Image: image, User: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess(res.data.message || "Tạo blog thành công!");
            setTitle("");
            setContent("");
            setImage("");
            setTimeout(() => navigate(`/home`), 1000);
        } catch (err) {
            setError("Tạo blog thất bại. Vui lòng thử lại!");
        }
    };

    return (
        <div>
            <div className={styles.backGround} style={{ backgroundImage: `url(${backgroundImg})` }}>
                <div className={styles.createNewBlogContainer}>
                    <h2 className={styles.heading}>Create New Blog</h2>

                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}

                    <form className={styles.createNewBlogForm} onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Write your title here..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Content</label>
                            <textarea
                                id="content"
                                placeholder="Write your content here..."
                                className={styles.content}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Image upload */}
                        <div className={styles.formGroup}>
                            <label htmlFor="image">Image URL</label>
                            <input
                                id="image"
                                type="text"
                                placeholder="Put image URL here..."
                                value={image}
                                onChange={(e) => setImage(e.target.value)}
                            />
                        </div>

                        {/* Submit button */}
                        <button type="submit" className={styles.submitButton}>
                            Create
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateBlog;
