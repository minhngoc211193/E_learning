import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const Major = () => {
    const[majorData, setMajorData] = useState({
            Name:"",
            Description:"",  
        });
    const [majors, setMajors] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
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
            const response = await axios.get('http://localhost:8000/major/majors');
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
                await axios.put(`http://localhost:8000/major/update-major/${editingId}`, majorData);
            } else {
                await axios.post('http://localhost:8000/major/create-major', majorData);
            }
            setMajorData({ Name: "", Description: "" });
            setEditingId(null);
            fetchMajors();
        } catch (error) {
            console.error("Error saving major", error);
        }
    };

    const handleEdit = (major) => {
        setMajorData({ Name: major.Name, Description: major.Description });
        setEditingId(major._id);
    };

    const handleDelete = async (_id) => {
        try {
            await axios.delete(`http://localhost:8000/major/delete-major/${_id}`);
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
                <button type="submit">{editingId ? "Update" : "Create"} Major</button>
            </form>
            <ul>
                {majors.map((major) => (
                    <li key={major._id}>
                        {major.Name} - {major.Description}
                        <button onClick={() => handleEdit(major)}>Edit</button>
                        <button onClick={() => handleDelete(major._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
export default Major;
