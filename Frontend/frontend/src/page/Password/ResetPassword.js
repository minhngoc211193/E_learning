import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ResetPassword.module.css";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const navigate = useNavigate();

  // Hiệu ứng chỉ chạy ở bước 2 để đếm ngược thời gian OTP
  useEffect(() => {
    if (step !== 2) return; // chỉ chạy khi ở step2
    if (timeLeft <= 0) {
        setSuccess("");
        setError("OTP hết hạn, vui lòng gửi lại OTP");
        setStep(1);
        setTimeLeft(300);
        return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, step]);

  // Hàm chuyển đổi giây sang định dạng phút:giây
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Step 1: Gửi OTP về email
  const handleSendOTP = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/auth/forgot-password", { Email: email });
      setSuccess(res.data.message);
      setStep(2); // chuyển sang bước 2
      setTimeLeft(300); // reset bộ đếm thời gian
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi gửi OTP");
    }
  };

  // Step 2: Xác thực OTP
  const handleVerifyOTP = async () => {
    setError("");
    setSuccess("");
    if (!otp.trim()) {
      setError("Vui lòng nhập OTP");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/auth/verify-otp", { Email: email, otp });
      setSuccess(res.data.message);
      setStep(3); // chuyển sang bước 3
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi xác thực OTP");
    }
  };

  // Step 3: Đặt lại mật khẩu với OTP
  const handleResetPassword = async () => {
    setError("");
    setSuccess("");
    if (!newPassword.trim() || !confirmNewPassword.trim()) {
      setError("Vui lòng nhập đầy đủ mật khẩu");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8000/auth/reset-password-otp", { Email: email, newPassword });
      setSuccess(res.data.message);
      setTimeout(() => navigate("/l"), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  return (
    <div className={styles.body}>
      {/* Step 1: Nhập email và gửi OTP */}
      {step === 1 && (
        <div className={styles.step1}>
          <span>
            <i className="fa-solid fa-lock"></i>
          </span>
          <h1>Forgot password</h1>
          <h4>You can reset your password here</h4>
          <div className={styles.typeEmail}>
            <i className="fa-solid fa-envelope"></i>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button onClick={handleSendOTP}>Send OTP</button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </div>
      )}

      {/* Step 2: Nhập OTP */}
      {step === 2 && (
        <div className={styles.step2}>
          <div className={styles.countdown}>
            <div className={styles.mainCountdown} style={{ color: timeLeft === 0 ? "red" : "green" }}>
              <p>{formatTime(timeLeft)}</p>
            </div>
          </div>
          <h4 className={styles.heading}>Please, check your email</h4>
          <div className={styles.typeOTP}>
            <i className="fa-solid fa-envelope"></i>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button onClick={handleVerifyOTP}>Confirm</button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </div>
      )}

      {/* Step 3: Đặt lại mật khẩu */}
      {step === 3 && (
        <div className={styles.step3}>
          <span>
            <i className="fa-solid fa-lock"></i>
          </span>
          <h1>Forgot password</h1>
          <h4>Reset your password</h4>
          <div className={styles.typePassword}>
            <i className="fa-solid fa-key"></i>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className={styles.typePassword}>
            <i className="fa-solid fa-key"></i>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
          <button onClick={handleResetPassword}>Save</button>
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}
        </div>
      )}
    </div>
  );
}

export default ResetPassword;
