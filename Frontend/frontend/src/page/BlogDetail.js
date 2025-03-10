import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
import axios from 'axios';
import styles from './BlogDetail.module.css';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import BackButton from '../components/BackButton';

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState(""); 
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("accessToken");
  
 
  const currentUserId = jwtDecode(token).id;

  const toggleEditComment = (comment) => {
    if (editingCommentId === comment._id) {
      setEditingCommentId(null);
    } else {
      setEditingCommentId(comment._id);
      setEditedComment(comment.Content); 
    }
  };

  const fetchBlog = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:8000/blog/detail-blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlog(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog detail.");
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id;

      await axios.post(
        "http://localhost:8000/comment/create-comment",
        {
          Content: comment,
          Blog: id,
          User: userId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      fetchBlog();
    } catch (err) {
      alert("Failed to post comment.");
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:8000/comment/delete-comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlog();
    } catch (err) {
      alert("Failed to delete comment.");
    }
  };

  // Hàm cập nhật bình luận
  const updateComment = async (commentId) => {
    if (!editedComment.trim()) return;
    try {
      await axios.put(
        `http://localhost:8000/comment/update-comment/${commentId}`,
        { Content: editedComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingCommentId(null);
      fetchBlog();
    } catch (err) {
      alert("Failed to update comment.");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
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
            <h2>{blog.User?.Fullname || "Unknown"}</h2>
          </div>
        </div>
        <p className={styles.date}>{formatDate(blog.updatedAt)}</p>
      </div>
      <div className={styles.commentContainer}>
        <h2>{blog.Comments && blog.Comments.length > 0 ? `${blog.Comments.length} Comment(s)` : "No comments"}</h2>
        {blog.Comments && blog.Comments.length > 0 && blog.Comments.map((comment) => (
          <div key={comment._id} className={styles.mainComment}>
            <div className={styles.userComment}>
              <div className={styles.userComentLeft}>
                <span><i className="fa-solid fa-user"></i></span>
                <h3>{comment.User?.Fullname || "Anonymous"}</h3>
              </div>
              {/* Chỉ hiển thị options nếu comment của người đăng nhập */}
              {comment.User?._id === currentUserId && (
                <div className={styles.options}>
                  <span className={styles.trash} onClick={() => deleteComment(comment._id)}>
                    <i className="fa-solid fa-trash"></i>
                  </span>
                  <span className={styles.edit} onClick={() => toggleEditComment(comment)}>
                    <i className="fa-solid fa-pen"></i>
                  </span>
                </div>
              )}
            </div>
            <div className={styles.commentContent}>
              {editingCommentId !== comment._id && <p>{comment.Content}</p>}
              {editingCommentId === comment._id && (
                <div className={styles.editComment}>
                  <input
                    type="text"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    placeholder="Edit your comment"
                  />
                  <button className={styles.saveComment} onClick={() => updateComment(comment._id)}>Save</button>
                  <button className={styles.cancelComment} onClick={() => setEditingCommentId(null)}>Cancel</button>
                </div>
              )}
            </div>
            <div className={styles.dateComment}>
              <p>{formatDate(comment.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.yourComment}>
        <span><i className="fa-solid fa-user"></i></span>
        <input
          type="text"
          className={styles.yourCommentText}
          placeholder="Leave your comment here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button className={styles.submitComment} onClick={postComment}>Post</button>
      </div>
      <Footer />
    </div>
  );
}

export default BlogDetail;
