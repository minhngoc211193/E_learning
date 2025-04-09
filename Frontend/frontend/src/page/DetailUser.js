import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Menu from '../components/Menu';
import styles from './DetailUser.module.css';

const DetailUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDetail = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const response = await axios.get(`http://localhost:8000/user/detail-user/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (err) {
                setError("Lỗi khi tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, [id]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;
    if (!user) return <p>Không tìm thấy người dùng</p>;

    return (
        <div className={styles.layout}>
            <Menu />
            <div className={styles.content}>
                <div className={styles.card}>
                    <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
                    <h2 className={styles.header}>User Details</h2>
                    {user.Image && (
                        <img 
                            src={
                                user.Image.startsWith("data:image/")
                                ? user.Image
                                : `data:image/jpeg;base64,${user.Image}`
                            }
                            alt="User Avatar"
                            className={styles.avatar}
                        />
                    )}
                    <p><strong>Họ và tên:</strong> {user.Fullname}</p>
                    <p><strong>Tên đăng nhập:</strong> {user.Username}</p>
                    <p><strong>Số điện thoại:</strong> {user.PhoneNumber}</p>
                    <p><strong>Giới tính:</strong> {user.Gender}</p>
                    <p><strong>Ngày sinh:</strong> {new Date(user.DateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Role:</strong> {user.Role}</p>
                    <p><strong>Chuyên ngành:</strong> {user.Major?.Name || "Chưa có dữ liệu"}</p>
                    {user.Role === "student" && <p><strong>Năm học:</strong> {user.SchoolYear}</p>}

                    <div className={styles.buttonWrapper}>
                        <button 
                            className={styles.editButton}
                            onClick={() => navigate(`/update-user/${user._id}`)}
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailUser;
