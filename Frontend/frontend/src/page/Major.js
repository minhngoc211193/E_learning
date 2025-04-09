import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import styles from './Major.module.css';
import Menu from '../components/Menu';
import { notification } from "antd";

function Major () {
    const[majorData, setMajorData] = useState({
            Name:"",
            Description:"",
            CodeMajor: ""  
        });
    const [majors, setMajors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();
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

    useEffect(() => {
      if (token) {
          try {
              const decodedToken = JSON.parse(atob(token.split(".")[1])); // Giải mã token
              if (decodedToken.Role !== "admin") {
                  openNotification("error", "You have to login with admin role!");
                  setTimeout(() =>navigate("/"), 1000); // Chuyển hướng về trang chủ
              }
          } catch (err) {
              openNotification("error", "Token không hợp lệ");
              setTimeout(() =>navigate("/home"), 1000); // Chuyển hướng về trang chủ
          }
      } else {
          openNotification("error", "Bạn cần đăng nhập trước!");
          setTimeout(() =>navigate("/"), 1000); // Chuyển hướng đến trang login nếu chưa có token
      }
  }, [navigate]);
    useEffect(() => {
        fetchMajors();
    }, []);

    const fetchMajors = async () => {
        try {
            const response = await axios.get('http://localhost:8000/major/majors', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
        } catch (error) {
            console.error("Error fetching majors", error);
        }
    };

    const handleChange = (e) => {
        setMajorData({ ...majorData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:8000/major/update-major/${editingId}`, majorData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('http://localhost:8000/major/create-major', majorData, {
                    headers: { Authorization: `Bearer ${token}` }, 
                });
            }
            console.log(majorData);
            setMajorData({ Name: "", Description: "", CodeMajor: "" });
            setEditingId(null);
            fetchMajors();
            openNotification("success");
        } catch (error) {
            console.error("Error saving major", error);
            const errorMessage = error.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };

    const handleEdit = (major) => {
        setMajorData({ Name: major.Name, Description: major.Description, CodeMajor: major.CodeMajor });
        setEditingId(major._id);
    };

    const handleDelete = async (_id) => {
        try {
            await axios.delete(`http://localhost:8000/major/delete-major/${_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMajors();
            openNotification("success");
        } catch (error) {
            console.error("Error deleting major", error);
            const errorMessage = error.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };
    const handleViewDetail = (id) => {
        navigate(`/detail-major/${id}`);
    };

    return (
        <div className={styles.body}>
            {contextHolder}
            <Menu />
            <div className={styles.container}>
                <h1>Manage Majors</h1>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <input type="text" name="Name" value={majorData.Name} onChange={handleChange} placeholder="Major Name" required />
                    <input type="text" name="Description" value={majorData.Description} onChange={handleChange} placeholder="Description" required />
                    <input type="text" name="CodeMajor" value={majorData.CodeMajor} onChange={handleChange} placeholder="Code Major" required />
                    <button type="submit">{editingId ? "Update" : "Create"} Major</button>
                </form>

                <div className={styles.cardContainer}>
                    {majors.map((major) => (
                        <div key={major._id} className={styles.card} onClick={() => handleViewDetail(major._id)}>
                            <h3>{major.Name}</h3>
                            <p>{major.Description}</p>
                            <p><strong>Code:</strong> {major.CodeMajor}</p>
                            <div className={styles.cardActions}>
                            <button onClick={(e) => {e.stopPropagation(); // ⛔ stop chuyển trang
                            handleEdit(major);}}>Edit
                            </button>
                            <button onClick={(e) => {e.stopPropagation(); // ⛔ stop chuyển trang
                            handleDelete(major._id);}}>Delete
                            </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Major;
