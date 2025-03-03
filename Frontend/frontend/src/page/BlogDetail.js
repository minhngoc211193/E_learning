import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './BlogDetail.module.css';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import BackButton from '../components/BackButton';

function BlogDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!blog) {
      setError("Blog data is not available. Please navigate from the blog list.");
      setLoading(false);
    }
  }, [blog]);
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Menu />
        <p>Loading blog detail...</p>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Menu />
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Menu />
      <BackButton />
      <div className={styles.headerPicture}>
        <img src={blog.Image} alt="Header" />
      </div>
      <div className={styles.containerContent}>
        <div className={styles.mainContent}>
          <h1>{blog.Title}</h1>
          <p>{blog.Content}</p>
        </div>
      </div>
      <div className={styles.authorProfile}>
        <h2>Author</h2>
        <div className={styles.authorInfo}>
          <span>
            <i className="fa-solid fa-user"></i>
          </span>
          <div className={styles.authorAvar}>
            <h2>{blog.User?.Username || "Unknown"}</h2>
            <h4>{blog.User?.Role || ""}</h4>
          </div>
        </div>
        <p className={styles.date}>{formatDate(blog.createdAt)}</p>
      </div>
      <div className={styles.commentContainer}>
        <h2>
          {blog.Comments && blog.Comments.length > 0
            ? `${blog.Comments.length} Comment(s)`
            : "No comments"}
        </h2>
        {blog.Comments &&
          blog.Comments.map((comment) => (
            <div key={comment._id} className={styles.mainComment}>
              <div className={styles.userComment}>
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>
                <h3>{comment.User?.Username || "Anonymous"}</h3>
              </div>
              <div className={styles.commentContent}>
                <p>{comment.Content}</p>
              </div>
              <div className={styles.dateComment}>
                <p>{formatDate(comment.createdAt)}</p>
              </div>
            </div>
          ))}
      </div>
      <div className={styles.yourComment}>
        <span>
          <i className="fa-solid fa-user"></i>
        </span>
        <input
          type="text"
          className={styles.yourCommentText}
          placeholder="Leave your comment here"
        />
        <button className={styles.submitComment}>Post</button>
      </div>
      <Footer />
    </div>
  );
}

export default BlogDetail;
