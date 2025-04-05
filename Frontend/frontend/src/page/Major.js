import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

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

    useEffect(() => {
      if (token) {
          try {
              const decodedToken = JSON.parse(atob(token.split(".")[1])); // Giải mã token
              if (decodedToken.Role !== "admin") {
                  alert("You have to login with admin role!");
                  navigate("/"); // Chuyển hướng về trang chủ
              }
          } catch (err) {
              console.error("Token không hợp lệ", err);
              navigate("/home"); 
          }
      } else {
          alert("Bạn cần đăng nhập trước!");
          navigate("/"); // Chuyển hướng đến trang login nếu chưa có token
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
        } catch (error) {
            console.error("Error saving major", error);
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
        } catch (error) {
            console.error("Error deleting major", error);
        }
    };

    return (
        <div>
            <h1>Manage Majors</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="Name" value={majorData.Name} onChange={handleChange} placeholder="Major Name" required />
                <input type="text" name="Description" value={majorData.Description} onChange={handleChange} placeholder="Description" required />
                <input type="text" name="CodeMajor" value={majorData.CodeMajor} onChange={handleChange} placeholder="Code Major" required />
                <button type="submit">{editingId ? "Update" : "Create"} Major</button>
            </form>
            <ul>
                {majors.map((major) => (
                    <li key={major._id}>
                        {major.Name} - {major.Description} - {major.CodeMajor}
                        <button onClick={() => handleEdit(major)}>Edit</button>
                        <button onClick={() => handleDelete(major._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Major;
