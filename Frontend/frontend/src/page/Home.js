import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';
import backgroundImg from '../assets/banner.jpg';
import Footer from '../components/Footer';
import Header from '../components/Header';

function Home() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Gọi API lấy danh sách blog
    const fetchBlogs = (search = "") => {
        const token = localStorage.getItem("accessToken");
        const url = search 
            ? `http://localhost:8000/blog/search-blog?search=${search}`
            : "http://localhost:8000/blog/blogs";

        axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setBlogs(response.data))
        .catch(error => console.error("Error fetching blogs:", error));
    };

    // Lấy danh sách blog khi load trang
    useEffect(() => {
        fetchBlogs();
    }, []);

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
            <Header />
            <div className={styles.header} style={{ backgroundImage: `url(${backgroundImg})` }}>
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
            </div>
            <Footer />
        </div>
    );
}

export default Home;
