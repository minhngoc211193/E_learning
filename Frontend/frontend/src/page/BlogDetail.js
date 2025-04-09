import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import styles from './BlogDetail.module.css';
import Footer from '../components/Footer';
import BackButton from '../components/BackButton';
import Swal from "sweetalert2";
import ProfileImg from "../assets/profile.jpg";

function BlogDetail() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [error, setError] = useState("");
  const [comment, setComment] = useState("");
  const [imageUser, setImageUser] = useState("");
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

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      console.error("Bạn chưa đăng nhập!");
      return;
    }
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImageUser(res.data.Image);
    } catch (err) {
      console.error("Không thể lấy thông tin người dùng.");
    }
  };

useEffect(() => {
    fetchUserInfo();
}, []);

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      postComment();
    }
  };

  const deleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: "Do you want to delete this comment?",
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
      await axios.delete(`http://localhost:8000/comment/delete-comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBlog();
      Swal.fire("Đã xóa!", "Comment delete successfully.", "success");
    } catch (err) {
      Swal.fire("Lỗi!", "Cannot delete this comment.", "error");
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
        <p>Loading blog detail...</p>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <Footer />
      </div>
    );
  }

  return (
    <div>
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
          <img className={styles.authorInfoImage} src={blog.User.Image || ProfileImg} alt="User" />
          <div className={styles.authorAvar}>
            <h2>{blog.User?.Fullname || "Unknown"}</h2>
          </div>
        </div>
        <p className={styles.date}>{formatDate(blog.updatedAt)}</p>
      </div>
      <div className={styles.commentContainer}>
        <h2>
          {blog.Comments && blog.Comments.length > 0
            ? `${blog.Comments.length} Comment(s)`
            : "No comments"}
        </h2>
        {blog.Comments && blog.Comments.length > 0 && blog.Comments.map((commentItem) => (
          <div key={commentItem._id} className={styles.mainComment}>
            <div className={styles.userComment}>
              <div className={styles.userComentLeft}>
                <img className={styles.userComentLeftImage} src={commentItem.User.Image || ProfileImg} alt="User" />
                <h3>{commentItem.User?.Fullname || "Anonymous"}</h3>
              </div>
              <div className={styles.options}>
                {/* Nếu comment của người đăng nhập, hiển thị cả sửa và xóa */}
                {commentItem.User?._id === currentUserId && (
                  <>
                    <span className={styles.trash} onClick={() => deleteComment(commentItem._id)}>
                      <i className="fa-solid fa-trash"></i>
                    </span>
                    <span className={styles.edit} onClick={() => toggleEditComment(commentItem)}>
                      <i className="fa-solid fa-pen"></i>
                    </span>
                  </>
                )}
                {/* Nếu không phải comment của người đăng nhập nhưng người đang đăng nhập là chủ bài blog */}
                {commentItem.User?._id !== currentUserId && blog.User?._id === currentUserId && (
                  <span className={styles.trash} onClick={() => deleteComment(commentItem._id)}>
                    <i className="fa-solid fa-trash"></i>
                  </span>
                )}
              </div>
            </div>
            <div className={styles.commentContent}>
              {editingCommentId !== commentItem._id && <p>{commentItem.Content}</p>}
              {editingCommentId === commentItem._id && (
                <div className={styles.editComment}>
                  <input
                    type="text"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                    placeholder="Edit your comment"
                  />
                  <button className={styles.saveComment} onClick={() => updateComment(commentItem._id)}>Save</button>
                  <button className={styles.cancelComment} onClick={() => setEditingCommentId(null)}>Cancel</button>
                </div>
              )}
            </div>
            <div className={styles.dateComment}>
              <p>{formatDate(commentItem.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.yourComment}>
        <img src={imageUser || ProfileImg} alt="User" />
        <input
          type="text"
          className={styles.yourCommentText}
          placeholder="Leave your comment here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className={styles.submitComment} onClick={postComment}>Post</button>
      </div>
      <Footer />
    </div>
  );
}

export default BlogDetail;
