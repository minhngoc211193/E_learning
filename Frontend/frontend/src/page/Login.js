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
            localStorage.setItem("accessToken", res.data.accessToken);
            window.location.href = "/home";
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div className={styles.form}>
            <div className={styles.content}>
                <form onSubmit={handleLogin}>
                    <h1>Sign in</h1>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required/>
                    <input type="password" value={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)}
                        required/>
                    <a href="#">Forgot your password?</a>
                    <button type="submit">Sign In</button>
                </form>
                <div className={styles.imageSection}>
                    <img src={studyImg} className={styles.image} />
                </div>
            </div>
        </div>
      );
}

export default Login;