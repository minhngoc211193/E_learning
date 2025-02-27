import React from 'react'
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css'
import backgroundImg  from '../assets/window.jpg'
import Footer from '../components/Footer';
import Menu from '../components/Menu';

function Home() {
    const navigate = useNavigate();

  return (
    <div>
        <Menu />
        <div className={styles.header} style={{ backgroundImage: `url(${backgroundImg})` }}>
            <div className={styles.content}>
                <div className={styles.contentTop}>
                    <h1>E-lerning</h1>
                    <div className={styles.search}>
                        <input type="text" placeholder='Search for blog' />
                        <button>Search</button>
                    </div>
                </div>
            </div>
        </div>
        <div className={styles.main}>
            <h1 className={styles.latestBlogs}>Latest blogs</h1>
            <div className={styles.blogContainer}>
                <div onClick={() => navigate('/blogDetail')} className={`${styles.blogCard} ${styles.large}`}>
                    <img src={backgroundImg} alt="blog" className={styles.blogImage} />
                    <div className={styles.blogContent}>
                        <span>Category</span>
                        <h2>Title</h2>
                        <p>Description</p>
                    </div>
                </div>
                <div className={`${styles.blogCard} ${styles.large}`}>
                    <img src={backgroundImg} alt="blog" className={styles.blogImage} />
                    <div className={styles.blogContent}>
                        <span>Category</span>
                        <h2>Title</h2>
                        <p>Description</p>
                    </div>
                </div>
                <div className={`${styles.blogCard} ${styles.small}`}>
                    <img src={backgroundImg} alt="blog" className={styles.blogImage} />
                    <div className={styles.blogContent}>
                        <span>Category</span>
                        <h2>Title</h2>
                        <p>Description</p>
                    </div>
                </div>
                <div className={`${styles.blogCard} ${styles.small}`}>
                    <img src={backgroundImg} alt="blog" className={styles.blogImage} />
                    <div className={styles.blogContent}>
                        <span>Category</span>
                        <h2>Title</h2>
                        <p>Description</p>
                    </div>
                </div>
                <div className={`${styles.blogCard} ${styles.small}`}>
                    <img src={backgroundImg} alt="blog" className={styles.blogImage} />
                    <div className={styles.blogContent}>
                        <span>Category</span>
                        <h2>Title</h2>
                        <p>Description</p>
                    </div>
                </div>
            </div>
        </div>
        <Footer/>
    </div>
  )
}
export default Home;