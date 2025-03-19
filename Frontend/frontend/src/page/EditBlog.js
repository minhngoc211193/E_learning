import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./EditBlog.module.css";
import backgroundImg from "../assets/abc.jpg";

function EditBlog() {
    const { id } = useParams();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    setError("Bạn chưa đăng nhập!");
                    return;
                }
                const res = await axios.get(`http://localhost:8000/blog/detail-blog/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTitle(res.data.Title);
                setContent(res.data.Content);
                setImage(res.data.Image);
            } catch (err) {
                setError("Không thể tải blog. Vui lòng thử lại!");
            }
        };
        fetchBlog();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!title.trim() || !content.trim() || !image.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                return;
            }

            const decoded = jwtDecode(token);
            const userId = decoded.id;

            await axios.put(
                `http://localhost:8000/blog/update-blog/${id}`,
                { Title: title, Content: content, Image: image, User: userId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Cập nhật blog thành công!");
            setTimeout(() => navigate(`/manageblog`), 1000);
        } catch (err) {
            setError("Cập nhật blog thất bại. Vui lòng thử lại!");
        }
    };



  return (
    <div>
      <div className={styles.backGround} style={{ backgroundImage: `url(${backgroundImg})` }}>
        <div className={styles.editBlogContainer}>
          <h2 className={styles.heading}>Edit blog</h2>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
          <form className={styles.editBlogForm} onSubmit={handleSubmit}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            {/* Content */}
            <div className={styles.formGroup}>
              <label htmlFor="content">Content</label>
              <textarea id="content" className={styles.content} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            {/* Image upload */}
            <div className={styles.formGroup}>
              <label htmlFor="imageFile">Image title</label>
              <input id="image" type="text" value={image} onChange={(e) => setImage(e.target.value)} />
            </div>

            {/* Submit button */}
            <button type="submit" className={styles.submitButton}>
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
