import React, { useState } from "react";
import styles from "./Login.module.css";
import studyImg from "../assets/study.jpg";
import axios from "axios";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
    
        try {
            const res = await axios.post("http://localhost:8000/auth/login", { Email: email, Password: password });
    
            // Lưu token & chuyển hướng
            localStorage.setItem("accessToken", res.data.accessToken);
            window.location.href = "/home";
    
        } catch (err) {
            if (err.response) {
                if (err.response.data.errors) {
                    setError(err.response.data.errors[0].msg);
                } else if (err.response.data.message) {
                    setError(err.response.data.message);
                }
            } else {
                setError("Đăng nhập thất bại. Vui lòng thử lại!");
            }
        }
    };
    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <form onSubmit={handleLogin}>
                    <h1>Sign in</h1>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                    {error && <p className={styles.errorMessage} style={{ visibility: error ? "visible" : "hidden" }}>{error}</p>}
                    <a href="/resetpassword">Forgot your password?</a>
                    <button className={styles.btnSignIn} type="submit">Sign In</button>
                </form>
                <div className={styles.imageSection}>
                    <img src={studyImg} className={styles.image} alt="" />
                </div>
            </div>
        </div>
    );
}

export default Login;