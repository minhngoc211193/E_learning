import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Home.module.css';
import backgroundImg from '../assets/banner.jpg';
import Footer from '../components/Footer';
import Menu from '../components/Menu';

function Home() {
    const navigate = useNavigate();
    const [blogs, setBlogs] = useState([]);

    // Gọi API lấy danh sách blog
    useEffect(() => {
        const token = localStorage.getItem("accessToken"); // Lấy token từ localStorage
        axios.get('http://localhost:8000/blog/blogs', {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => setBlogs(response.data))
        .catch(error => console.error("Error fetching blogs:", error));
    }, []);

    return (
        <div>
            <Menu />
            <div className={styles.header} style={{ backgroundImage: `url(${backgroundImg})` }}>
                <div className={styles.content}>
                    <div className={styles.contentTop}>
                        <h1>E-learning</h1>
                    </div>
                </div>
            </div>
            <div className={styles.main}>
                <div className={styles.search}>
                            <input type="text" placeholder='Search for blog' />
                            <button><i class="fa-solid fa-magnifying-glass"></i></button>
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
