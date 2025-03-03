import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import styles from "./ManageBlog.module.css";
import BackButton from '../components/BackButton';

function ManageBlog() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('http://localhost:8000/blog/blogs');
      setBlogs(res.data);
    } catch (error) {
      console.error("Error fetching blogs", error);
    }
  };

  // Xử lý xóa blog
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/blog/delete-blog/${id}`);
      setBlogs(blogs.filter((blog) => blog._id !== id));
    } catch (error) {
      console.error("Error deleting blog", error);
    }
  };

  const handleEdit = (blog) => {
    navigate(`/editblog/${blog._id}`, { state: blog });
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
        <BackButton />
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
                  <th>User name</th>
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
                    <td>{blog.User?.Username || "N/A"}</td>
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
                      <button 
                        className={styles.btnEdit}
                        onClick={() => handleEdit(blog)}>
                        <i className="fa-solid fa-pen"></i>
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
