import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditUser.module.css"; // Import CSS module nếu có
import {jwtDecode} from 'jwt-decode';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    Image:"",
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

  const fetchUserInfo = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.error("Bạn chưa đăng nhập!");
        return;
    }
    try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await axios.get(`http://localhost:8000/user/detail-user/${userId}`, {
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
                Major: res.data.Major || "",
                Gender: res.data.Gender || "",
                SchoolYear: res.data.SchoolYear || ""
            });
        }
    } catch (err) {
        console.error("Không thể lấy thông tin người dùng.", err);
    }
};
useEffect(() => {
    fetchUserInfo();
},[]);
useEffect(() => {
    axios.get("http://localhost:8000/major/majors").then((res) => {
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
    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Bạn cần đăng nhập trước!");
        navigate("/");
        return;
    }

    try {
        // Giải mã token để lấy thông tin user
        const decodedToken = jwtDecode(token);
        
        // Kiểm tra nếu không phải admin, chặn cập nhật
        if (decodedToken.Role !== "admin") {
            alert("Bạn không có quyền chỉnh sửa người dùng!");
            return;
        }

        const formData = new FormData();
        formData.append("Fullname", userData.Fullname);
        formData.append("Username", userData.Username);
        formData.append("PhoneNumber", userData.PhoneNumber);
        formData.append("Gender", userData.Gender);
        formData.append("DateOfBirth", userData.DateOfBirth);
        formData.append("Major", userData.Major);
        if (userData.SchoolYear) formData.append("SchoolYear", userData.SchoolYear);
        if (userData.Image) formData.append("Image", userData.Image); // Chỉ gửi ảnh nếu có

        await axios.put(`http://localhost:8000/user/update-user/${id}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        alert("Cập nhật thành công!");
        navigate("/manageuser");
    } catch (error) {
        console.error("Lỗi khi cập nhật user:", error);
        alert("Cập nhật thất bại!");
    }
};

  return (
    <div className={styles.createPage}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Edit User</h1>
        <div className={styles.formGrid}>
          <input
            type="text"
            name="Fullname"
            placeholder="Full Name"
            value={userData.Fullname}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="text"
            name="Username"
            placeholder="Username"
            value={userData.Username}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <input
            type="tel"
            name="PhoneNumber"
            placeholder="Phone Number"
            value={userData.PhoneNumber}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <select
            name="Gender"
            value={userData.Gender}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          <input
            type="date"
            name="DateOfBirth"
            value={userData.DateOfBirth}
            onChange={handleChange}
            className={styles.input}
            required
          />
          <select
            name="Major"
            value={userData.Major}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select Major</option>
            {majors.map((major) => (
              <option key={major._id} value={major._id}>
                {major.Name}
              </option>
            ))}
          </select>
          {userData.Role === "student" && (
            <input
              type="number"
              name="SchoolYear"
              placeholder="School Year"
              value={userData.SchoolYear}
              onChange={handleChange}
              className={styles.input}
            />
          )}
          <label className={styles.imageLabel}>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            Chọn ảnh mới
          </label>
          {userData.PreviewImage && (
            <img
              src={userData.PreviewImage}
              alt="User Avatar"
              className={styles.avatar}
            />
          )}
          <button type="submit" className={styles.create}>
            Update User
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
