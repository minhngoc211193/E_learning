import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';
import backgroundImg from '../assets/banner.jpg';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { notification, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback((type, detailMessage = "", pauseOnHover = true) => {
    if (type === "success") {
      api.open({
        message: 'Success!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    } else {
      api.open({
        message: 'Failed!',
        description: detailMessage,
        showProgress: true,
        pauseOnHover,
      });
    }
  }, [api]);

  const fetchBlogs = useCallback(async (search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const url = search
        ? `https://e-learning-backend-fsih.onrender.com/blog/search-blog?search=${search}`
        : "https://e-learning-backend-fsih.onrender.com/blog/blogs";

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBlogs(
        response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (error) {
      console.error("Error fetching blogs:", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred while fetching blogs.";

      openNotification("error", errorMessage);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  }, [openNotification]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  // Xử lý tìm kiếm khi nhấn nút
  const handleSearch = () => {
    fetchBlogs(searchQuery);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      {contextHolder}
      <Header />
      <div>
        <img className={styles.header} src={backgroundImg} alt="Background" />
      </div>
      <div className={styles.main}>
        <div className={styles.search}>
          <input
            type="text"
            placeholder="Search for blog"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
        <h1 className={styles.latestBlogs}>Latest blogs</h1>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          </div>
        ) : (
          <div className={styles.blogContainer}>
            {blogs.map((blog, index) => (
              <div
                key={blog._id}
                onClick={() => navigate(`/blogdetail/${blog._id}`, { state: blog })}
                className={`${styles.blogCard} ${index < 2 ? styles.large : styles.small}`} >
                <img src={blog.Image || backgroundImg} alt="blog" className={styles.blogImage} />
                <div className={styles.blogContent}>
                  <h2>{blog.Title}</h2>
                  <p>{blog.Content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Home;
