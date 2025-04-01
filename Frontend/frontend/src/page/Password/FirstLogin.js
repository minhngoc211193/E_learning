import React, { useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import styles from "./FirstLogin.module.css";
import img from "../../assets/study.jpg";

function FirstLogin() {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        setTimeout(() => navigate("/"), 1000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        // Kiểm tra nếu mật khẩu mới và xác nhận mật khẩu không khớp
        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
            return;
        }

        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                setError("Bạn chưa đăng nhập!");
                return;
            }

            // Giải mã token để lấy userId (giả sử userId được lưu ở key "id")
            const decoded = jwtDecode(token);
            const userId = decoded.id;
            await axios.post(
                "http://localhost:8000/auth/change-password",
                { userId, oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccess("Cập nhật mật khẩu thành công!");
            handleLogout();
        } catch (err) {
            if (err.response && err.response.data.message) {
                setError(`${err.response.data.message} ${err.response.data.error || ""}`);
            } else {
                setError("Cập nhật mật khẩu thất bại! Vui lòng thử lại.");
            }
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <form onSubmit={handleSubmit}>
                    <h1 className={styles.heading}>Change Password</h1>
                    <input
                        type="password"
                        placeholder="Password sent to your email"
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
                    <button className={styles.btnSave} type="submit">Save</button>
                </form>
                <div className={styles.imageSection}>
                    <img src={img} className={styles.image} alt="Study illustration" />
                </div>
            </div>
        </div>
    );
}

export default FirstLogin;