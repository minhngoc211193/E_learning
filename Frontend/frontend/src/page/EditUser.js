import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditUser.module.css"; // Import CSS module nếu có
import {jwtDecode} from 'jwt-decode';
import Menu from '../components/Menu';
import { notification } from "antd";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    Fullname: "",
    Username: "",
    PhoneNumber: "",
    Gender: "",
    DateOfBirth: "",
    Major: "",
    SchoolYear: "",
    Image: null, // Lưu ảnh mới nếu người dùng chọn
    PreviewImage: "", // Hiển thị ảnh preview
  });

  const [majors, setMajors] = useState([]);
  const token = localStorage.getItem("accessToken");
    const [api, contextHolder] = notification.useNotification();
    
        const openNotification = (type, detailMessage = "") => {
            if (type === "success") {
                api.open({
                    message: "Action uccessfully!",
                    description: "Your action has been successfully.",
                    showProgress: true,
                    pauseOnHover: true,
                });
            } else {
                api.open({
                    message: "Failed!",
                    description: detailMessage,
                    showProgress: true,
                    pauseOnHover: true,
                });
            }
        };

  const fetchUserInfo = async () => {
    
    try {
        const decoded = jwtDecode(token);
        if(decoded.Role!== "admin"){
          console.error("Bạn không có quyền chỉnh sửa ngừoi dùng!");
          openNotification("error", "Bạn không có quyền chỉnh sửa!");
          setTimeout(() =>navigate("/"), 2000); 
        }
        const res = await axios.get(`http://localhost:8000/user/detail-user/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200) {
            setUserData({
                Image: res.data.Image,
                Fullname: res.data.Fullname || "",
                Username: res.data.Username || "",
                Email: res.data.Email || "",
                Role: res.data.Role || "",
                PhoneNumber: res.data.PhoneNumber || "",
                DateOfBirth: new Date(res.data.DateOfBirth).toISOString().split('T')[0],
                Major: res.data.Major? res.data.Major._id : "",
                Gender: res.data.Gender || "",
                SchoolYear: res.data.SchoolYear || ""
            });
        }
    } catch (e) {
        console.error("Không thể lấy thông tin người dùng.", e);
        const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
    }
};
useEffect(() => {
    fetchUserInfo();
},[]);
useEffect(() => {
    axios.get("http://localhost:8000/major/majors", {
      headers: {Authorization: `Bearer ${token}`}
    }).then((res) => {
      setMajors(res.data);
    });
  }, []);
  

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // Xử lý chọn ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUserData({ ...userData, Image: file });
      const reader = new FileReader();
      reader.onloadend = () => setUserData((prev) => ({ ...prev, PreviewImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Fullname', userData.Fullname);
    formData.append('Username', userData.Username);
    formData.append('PhoneNumber', userData.PhoneNumber);
    formData.append('SchoolYear', userData.SchoolYear);
    formData.append('Gender', userData.Gender);
    formData.append('DateOfBirth', userData.DateOfBirth);
    formData.append('Major', userData.Major);
    if (userData.Image instanceof File) {
      formData.append('file', userData.Image);
    }

    try {
      const response = await axios.put(`http://localhost:8000/user/update-user/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}`,
       },

      });
      console.log(response.data);
      // Xử lý khi update thành công
      openNotification("success");
      setTimeout(() =>navigate(`/manageuser`), 2000); // Chuyển hướng đến trang chi tiết người dùng sau khi cập nhật
    } catch (error) {
      console.error('Lỗi cập nhật người dùng:', error);
      const errorMessage = error.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
    }
  };



  return (
    <div className={styles.body}>
      {contextHolder}
    <Menu />
    <div className={styles.createPage}>
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Edit User</h1>

      <div className={styles.avatarContainer}>
        <div className={styles.avatarWrapper}>
          <img src={userData.PreviewImage || userData.Image || "avatar.png"} alt="User Avatar" className={styles.avatar} />
          
          {/* Nút chọn ảnh (icon camera) */}
          <label className={styles.cameraIcon}>
            <input type="file" accept="image/*" onChange={handleImageChange} hidden />
            📷
          </label>
        </div>
      </div>

      {/* Form Grid */}
      <div className={styles.formGrid}>
        <div className={styles.inputGroup}>
          <label>Full Name:</label>
          <input type="text" name="Fullname" value={userData.Fullname} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label>Username:</label>
          <input type="text" name="Username" value={userData.Username} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label>Phone:</label>
          <input type="tel" name="PhoneNumber" value={userData.PhoneNumber} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label>Gender:</label>
          <select name="Gender" value={userData.Gender} onChange={handleChange} className={styles.select} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Date of Birth:</label>
          <input type="date" name="DateOfBirth" value={userData.DateOfBirth} onChange={handleChange} className={styles.input} required />
        </div>

        <div className={styles.inputGroup}>
          <label>Major:</label>
          <select name="Major" value={userData.Major} onChange={handleChange} className={styles.select} required>
            <option value="">Select Major</option>
            {majors.map((major) => (
              <option key={major._id} value={major._id}>{major.Name}</option>
            ))}
          </select>
        </div>

        {userData.Role === "student" && (
          <div className={styles.inputGroup}>
            <label>School Year:</label>
            <input type="number" name="SchoolYear" value={userData.SchoolYear} onChange={handleChange} className={styles.input} />
          </div>
        )}
      </div>
      {/* Nút Update */}
      <button type="submit" className={styles.create}>Update User</button>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
    </form>
    </div>
    </div>
  );
};

export default EditUser;
