import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./EditBlog.module.css";
import backgroundImg from '../assets/abc.jpg';
import BackButton from '../components/BackButton';

function EditBlog() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialBlog = location.state || {};
  const [blog, setBlog] = useState(initialBlog);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8000/blog/update-blog/${blog._id}`, blog);
      navigate("/manageblog")
    } catch (error) {
      console.error("Error updating blog", error);
    }
  };

  return (
    <div>
      <BackButton />
      <div className={styles.backGround} style={{ backgroundImage: `url(${backgroundImg})` }}>
        <div className={styles.editBlogContainer}>
          <h2 className={styles.heading}>Edit blog</h2>
          <form className={styles.editBlogForm} onSubmit={handleSubmit}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={blog.Title || ""}
                onChange={(e) => setBlog({ ...blog, Title: e.target.value })}
              />
            </div>

            {/* Content */}
            <div className={styles.formGroup}>
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                className={styles.content}
                value={blog.Content || ""}
                onChange={(e) => setBlog({ ...blog, Content: e.target.value })}
              ></textarea>
            </div>

            {/* Image upload */}
            <div className={styles.formGroup}>
              <label htmlFor="imageFile">Image title</label>
              <input
                id="imageFile"
                type="text"
                value={blog.Image || ""}
                onChange={(e) => setBlog({ ...blog, Image: e.target.value })}
              />
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
