import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import styles from "./ChangePassword.module.css";

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");

    const fetchUserInfo = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setError("Bạn chưa đăng nhập!");
            return;
        }
        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFullname(res.data.Fullname);
            setEmail(res.data.Email);
            setImage(res.data.Image);
        } catch (err) {
            setError("Không thể lấy thông tin người dùng.");
        }
    };
    fetchUserInfo();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setTimeout(() => navigate("/"), 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Kiểm tra các trường có được nhập đầy đủ không
        if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        // Kiểm tra xác nhận mật khẩu mới
        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            // Lấy accessToken từ localStorage và kiểm tra
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            await axios.post(
                "http://localhost:8000/auth/reset-password",
                { userId, oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Cập nhật mật khẩu thành công!");
            handleLogout();
        } catch (err) {
            if (err.response && err.response.data) {
                setError(`${err.response.data.message} ${err.response.data.error || ""}`);
            } else {
                setError("Cập nhật mật khẩu thất bại. Vui lòng thử lại!");
            }
        }
    };

    return (
        <div className={styles.body}>
            <div className={styles.backButton} onClick={() => navigate("/profile")}>
                <span><i class="fa-solid fa-arrow-left"></i></span>
            </div>
            <div className={styles.profile}>
                <img src={image} alt="Avatar" />
                <h2>{fullname}</h2>
                <h2>{email}</h2>
            </div>
            <div className={styles.main}>
                <form onSubmit={handleSubmit}>
                    <h1>Change Password</h1>
                    <input
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                    />
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    {success && <p className={styles.successMessage}>{success}</p>}
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>
    );
}

export default ChangePassword;
