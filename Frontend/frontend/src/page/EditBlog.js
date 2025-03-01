import React from "react";
import styles from "./EditBlog.module.css";
import backgroundImg from '../assets/abc.jpg'

function EditBlog() {
    return (
        <div>
            <div className={styles.backGround} style={{ backgroundImage: `url(${backgroundImg})` }}>
                <div className={styles.editBlogContainer}>
                    <h2 className={styles.heading}>Edit blog</h2>
                    <form className={styles.editBlogForm}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Title</label>
                            <input id="title" type="text" />
                        </div>

                        {/* Content */}
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Content</label>
                            <textarea id="content" className={styles.content}></textarea>
                        </div>

                        {/* Image upload */}
                        <div className={styles.formGroup}>
                            <label htmlFor="imageFile">Image title</label>
                            <input id="imageFile" type="text" />
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