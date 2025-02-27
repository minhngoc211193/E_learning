import React from 'react'
import styles from './Footer.module.css'

function Footer() {
    return(
        <div className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.aboutUs}>
                    <h2>About Us</h2>
                    <p>Greenwich Việt Nam là chương trình liên kết quốc tế giữa Đại học Greenwich, 
                        Vương Quốc Anh và trường đại học FPT với đông đảo sinh viên từ nhiều quốc gia trên thế giới đã và đang theo học.</p>
                    <p>Sinh viên tốt nghiệp sẽ nhận bằng Cử nhân (Bằng Đại học) do Đại học Greenwich, Vương Quốc Anh cấp, có giá trị toàn cầu.</p>
                </div>
                <div className={styles.system1}>
                    <h2>System</h2>
                    <h4>HÀ NỘI</h4>
                    <p>Tòa nhà Golden Park, Số 2 Phạm Văn Bạch, Yên Hòa, Cầu Giấy, Hà Nội</p>
                    <p>Hotline: 0971.274.545 - 0981.558.080<br/>
                        Điện thoại: 024.7300.2266</p>
                    <h4>ĐÀ NẴNG</h4>
                    <p>658 Ngô Quyền, An Hải Bắc, Sơn Trà, Đà Nẵng</p>
                    <p>Hotline: 0934.892.687<br/>
                        Điện thoại: 0236.730.2266</p>
                </div>
                <div className={styles.system2}>
                    <h4>HỒ CHÍ MINH</h4>
                    <p>Tòa nhà Cộng Hòa Garden, Số 20 Cộng Hòa, Phường 12, Tân Bình, TP. HCM</p>
                    <p>Hotline: 0933.108.554 - 0971.294.545<br/>
                        Điện thoại: 028.7300.2266</p>
                    <h4>CẦN THƠ</h4>
                    <p>- Cơ sở 1: Tòa nhà Gamma, Trường Đại học FPT Cần Thơ, Số 600 đường Nguyễn Văn Cừ, An Bình, Ninh Kiều, TP. Cần Thơ<br/>
                        - Cơ sở 2: Số 160 đường 30/4, Thới Bình, Ninh Kiều, TP. Cần Thơ</p>
                    <p>Hotline: 0968.670.804 - 0936.600.861<br/>
                        Điện thoại: 0292.730.0068</p>
                </div>
                <div className={styles.contact}>
                    <h2>Contact</h2>
                    <p>Contact us today if you want to become a student of Greenwich Vietnam, changes starts here.</p>
                    <p>Hotline: 086.779.1686<br/>
                        Email: info@greenwich.edu.vn</p>
                </div>
            </div>
            <div className={styles.footerBottom}>
                <p>&copy; 2025 E-learning.edu.vn. All Rights Reserved</p>
            </div>
        </div>
    )
}

export default Footer;