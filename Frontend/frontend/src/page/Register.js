// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Để chuyển hướng sau khi đăng ký thành công

const Register = () => {
    const [formData, setFormData] = useState({
        Fullname: '',
        Username: '',
        Email: '',
        Password: '',
        Role: 'student', // Default role là student
        Gender: 'Male', // Default gender là Male
        DateOfBirth: '',
        PhoneNumber: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); // Hook để chuyển hướng
const [message, setMessage] = useState("");
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                'http://localhost:8000/auth/register', // API của backend
                formData
            );
            alert('Đăng ký thành công!');
            navigate('/login'); // Chuyển hướng đến trang login sau khi đăng ký thành công
        } catch (err) {
            if (err.response && err.response.data.errors) {
                // Xử lý lỗi từ server (ví dụ: validation errors)
                setMessage(err.response.data.errors[0].msg);
            } else {
                setMessage((err.response?.data?.message || "có lỗi"));
            }
        }
    };
console.log(formData);
    return (
        <div className="register-form">
            <h2>Đăng ký tài khoản</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Họ và tên</label>
                    <input
                        type="text"
                        name="Fullname"
                        value={formData.Fullname}
                        onChange={handleChange}
                    />
                    {errors.Fullname && <p>{errors.Fullname}</p>}
                </div>
                <div>
                    <label>Tên đăng nhập</label>
                    <input
                        type="text"
                        name="Username"
                        value={formData.Username}
                        onChange={handleChange}
                    />
                    {errors.Username && <p>{errors.Username}</p>}
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="Email"
                        value={formData.Email}
                        onChange={handleChange}
                    />
                    {errors.Email && <p>{errors.Email}</p>}
                </div>
                <div>
                    <label>Mật khẩu</label>
                    <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                    />
                    {errors.Password && <p>{errors.Password}</p>}
                </div>
                <div>
                    <label>Giới tính</label>
                    <select
                        name="Gender"
                        value={formData.Gender}
                        onChange={handleChange}
                    >
                        <option value="Male">Nam</option>
                        <option value="Female">Nữ</option>
                    </select>
                </div>
                <div>
                    <label>Ngày sinh</label>
                    <input
                        type="date"
                        name="DateOfBirth"
                        value={formData.DateOfBirth}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Số điện thoại</label>
                    <input
                        type="text"
                        name="PhoneNumber"
                        value={formData.PhoneNumber}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Vai trò</label>
                    <select
                        name="Role"
                        value={formData.Role}
                        onChange={handleChange}
                    >
                        <option value="student">Sinh viên</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="admin">Quản trị viên</option>
                    </select>
                </div>
                <button type="submit">Đăng ký</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Register;
