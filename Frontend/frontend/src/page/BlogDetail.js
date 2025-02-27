import React from 'react';
import styles from './BlogDetail.module.css';
import headerPicture from '../assets/HeaderPicture.JPG';
import Footer from '../components/Footer';
import Menu from '../components/Menu';
import BackButton from '../components/BackButton';

function BlogDetail() {
    return (
        <div>
            <Menu />
            <BackButton />
            <div className={styles.headerPicture}>
                <img src={headerPicture} alt="Header" />
            </div>
            <div className={styles.containerContent}>
                <div className={styles.mainContent}>
                    <h1>Blog Detail</h1>
                    <p>Các thành viên Chính phủ theo phân công sẽ làm việc với các địa phương 
                        để đôn đốc triển khai thực hiện các kịch bản tăng trưởng đã được Chính 
                        phủ giao cho các địa phương.Các cuộc làm việc này cũng sẽ xử lý, giải quyết 
                        theo thẩm quyền hoặc đề xuất cấp có thẩm quyền xử lý, tháo gỡ các khó khăn, 
                        vướng mắc, thúc đẩy sản xuất kinh doanh, tạo công ăn việc làm, sinh kế cho 
                        người dân, giải ngân vốn đầu tư công, xuất nhập khẩu, xây dựng hạ tầng, 
                        nhà ở xã hội, phong trào thi đua xóa nhà tạm, nhà dột nát, các chương trình mục tiêu quốc gia trên địa bàn.</p>
                </div>
            </div>
            <div className={styles.authorProfile}>
                <h2>Author</h2>
                <div className={styles.authorInfo}>
                    <span><i class="fa-solid fa-user"></i></span>
                    <div className={styles.authorAvar}>
                        <h2>Author Name</h2>
                        <h4>Description</h4>
                    </div>
                </div>
                <p className={styles.date}>Friday, February</p>
            </div>
            <div className={styles.commentContainer}>
                <h2>Total comments</h2>
                <div className={styles.mainComment}>
                    <div className={styles.userComment}>
                        <span><i class="fa-solid fa-user"></i></span>
                        <h3>User name</h3>
                    </div>
                    <div className={styles.commentContent}>
                        <p>I think it very usefull for me.</p>
                    </div>
                    <div className={styles.dateComment}>
                        <p>Friday, February</p>
                    </div>
                </div>
                <div className={styles.mainComment}>
                    <div className={styles.userComment}>
                        <span><i class="fa-solid fa-user"></i></span>
                        <h3>User name</h3>
                    </div>
                    <div className={styles.commentContent}>
                        <p>I think it very usefull for me.</p>
                    </div>
                    <div className={styles.dateComment}>
                        <p>Friday, February</p>
                    </div>
                </div>
                <div className={styles.mainComment}>
                    <div className={styles.userComment}>
                        <span><i class="fa-solid fa-user"></i></span>
                        <h3>User name</h3>
                    </div>
                    <div className={styles.commentContent}>
                        <p>I think it very usefull for me.</p>
                    </div>
                    <div className={styles.dateComment}>
                        <p>Friday, February</p>
                    </div>
                </div>
            </div>
            <div className={styles.yourComment}>
                <span><i class="fa-solid fa-user"></i></span>
                <input type="text" className={styles.yourCommentText} placeholder="Leave your comment here"/>
                <button className={styles.submitComment}>Post</button>
            </div>
            <Footer />
        </div>
    )
}

export default BlogDetail;