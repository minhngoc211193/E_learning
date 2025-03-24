import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ManageBlog.module.css";
import BackButton from '../components/BackButton';
import Swal from "sweetalert2";
import Menu from "../components/Menu";


function ManageBlog() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("accessToken");

  
  const fetchBlogs = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8000/blog/blogs',{
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(res.data);
    } catch (error) {
      console.error("Error fetching blogs", error);
    }
  }, [token]);
  
  useEffect(() => {
    fetchBlogs();
  },[fetchBlogs]);
  
  // Xử lý xóa blog
  const handleDelete = async (id) => {
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
      await axios.delete(`http://localhost:8000/blog/delete-blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBlogs(blogs.filter((blog) => blog._id !== id));
  
      Swal.fire("Đã xóa!", "Blog đã được xóa thành công.", "success");
    } catch (error) {
      console.error("Lỗi khi xóa blog", error);
      Swal.fire("Lỗi!", "Không thể xóa blog.", "error");
    }
  };

  // Xử lý tìm kiếm blog theo tiêu đề
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.body}>
        <Menu />
      <div className={styles.container}>
        <h2>Manage blogs</h2>
        <div className={styles.main}>
          <div className={styles.topTable}>
            <span>
              <i className="fa-solid fa-file"></i> All blogs
            </span>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Find blog"
                className={styles.searchInput}
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <i className="fa-solid fa-magnifying-glass"></i>
            </div>
          </div>
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Full name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Create At</th>
                  <th>Update At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id}>
                    <td className={styles.titleColumn}>{blog.Title}</td>
                    <td>{blog.User?.Fullname || "N/A"}</td>
                    <td>{blog.User?.Role || "N/A"}</td>
                    <td>{blog.User?.Email || "N/A"}</td>
                    <td>{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(blog.updatedAt).toLocaleDateString()}</td>
                    <td className={styles.button}>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(blog._id)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageBlog;
