import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import styles from "./ChangePassword.module.css";
import ProfileImg from "../../assets/profile.jpg";

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Bạn chưa đăng nhập!");
        return;
      }
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;
        const res = await axios.get(`https://e-learning-backend-fsih.onrender.com/user/detail-user/${userId}`, {
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
  }, []); // Chỉ chạy một lần khi component mount

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
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      await axios.post(
        "https://e-learning-backend-fsih.onrender.com/auth/reset-password",
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
        <span>
          <i className="fa-solid fa-arrow-left"></i>
        </span>
      </div>
      <div className={styles.profile}>
        <img src={image || ProfileImg} alt="Avatar" />
        <h2>{fullname}</h2>
        <h2>{email}</h2>
      </div>
      <div className={styles.main}>
        <form onSubmit={handleSubmit}>
          <h1>Change Password</h1>
          <label>Old Password</label><br />
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          /> <br />
          <label>New Password</label><br />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          /><br />
          <label>Confirm New Password</label><br />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          /><br />
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
          <button type="submit">Save</button>
        </form>
      </div>
    </div>
  );
}

export default ChangePassword;
