import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./ManageBlog.module.css";
import Swal from "sweetalert2";
import Menu from "../components/Menu";

function ManageBlog() {
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (search = "") => {
    try {
      const token = localStorage.getItem("accessToken");
      const url = search
        ? `http://localhost:8000/blog/search-blog?search=${search}`
        : "http://localhost:8000/blog/blogs";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

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

      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog._id !== id));

      Swal.fire("Deleted!", "Blog has been deleted successfully.", "success");
    } catch (error) {
      console.error("Error deleting blog", error);
      Swal.fire("Error!", "Unable to delete blog.", "error");
    }
  };

  const handleSearch = () => {
    fetchBlogs(searchQuery);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

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
                placeholder="Search for blog"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.searchInput}
              />
              <i onClick={handleSearch} className="fa-solid fa-magnifying-glass"></i>
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
                {blogs.map((blog) => (
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
                        onClick={() => handleDelete(blog._id)}
                      >
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
