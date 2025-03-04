import React, { useState, useEffect } from 'react';
import styles from '../page/Subject.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Subject() {
    const [subjectData, setSubjectData] = useState({ Name: "", Description: "", Major:"" });
    const [userRole, setUserRole] = useState(null);
    const [majors, setMajors] = useState([]);
    const [userMajor, setUserMajor] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [editId, setEditId] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            try {
                const decodedToken = JSON.parse(atob(token.split(".")[1])); 
                setUserRole(decodedToken.Role);
                setUserMajor(decodedToken.Major || "");
                if (decodedToken.Role !== "admin") {
                    alert("You have to login!");
                    navigate("/home");
                    return;
                }
            } catch (err) {
                console.error("Token không hợp lệ", err);
                navigate("/");
            }
        } else {
            alert("Bạn cần đăng nhập trước!");
            navigate("/home");
        }
    }, [navigate]);

    useEffect(() => {
        if (userRole) {
            fetchSubjects();
        }
    }, [userRole]);

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

    const fetchSubjects = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            let response;
            if (userRole === "student" || userRole === "teacher") {
                response = await axios.get(`http://localhost:8000/subject/get-subjects-by-major/${userMajor}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                response = await axios.get("http://localhost:8000/subject/subjects", {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setSubjects(response.data);
        } catch (error) {
            console.error("Error fetching subjects", error);
        }
    };

    const handleChange = (e) => {
        setSubjectData({ ...subjectData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Sending subjectData:", subjectData); // Debug dữ liệu gửi lên
        try {
            const token = localStorage.getItem("accessToken");
            if (editId) {
                await axios.put(`http://localhost:8000/subject/update-subject/${editId}`, subjectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8000/subject/create-subject", subjectData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setSubjectData({ Name: "", Description: "", MajorId: "" });
            setEditId(null);
            fetchSubjects();
        } catch (error) {
            console.error("Error saving subject", error);
        }
    };
    
console.log(subjectData); //
    const handleEdit = (subject) => {
        setSubjectData({ Name: subject.Name, Description: subject.Description, Major: subject.Major || "" });
        setEditId(subject._id);
    };

    const handleDelete = async (_id) => {
        const token = localStorage.getItem("accessToken");
        try {
        await axios.delete(`http://localhost:8000/subject/delete-subject/${_id}`,{
            headers: { Authorization: `Bearer ${token}` }
        });
            
            fetchSubjects();
        } catch (error) {
            console.error("Error deleting subject", error);
        }
    };

    const handleMajorFilterChange = (e) => {
        setSelectedMajor(e.target.value);
    };

    const filteredSubjects = selectedMajor ? subjects.filter(subject => subject.Major._id === selectedMajor) : subjects;

    return (
        <section className="Subjectsection">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-6 text-center mb-5">
                        <h2 className="heading-section">Manage Subjects</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <h4 className="text-center mb-4">Filter by Major</h4>
                        <select className="form-control" value={selectedMajor} onChange={handleMajorFilterChange}>
                            <option value="">All Majors</option>
                            {majors.map((major) => (
                                <option key={major._id} value={major._id}>{major.Name}</option>
                            ))}
                        </select>
                        <h4 className="text-center mb-4">Subject Form</h4>
                        <form onSubmit={handleSubmit} className="subject-form">
                            <input type="text" name="Name" value={subjectData.Name} onChange={handleChange} placeholder="Subject Name" required className="form-control" />
                            <input type="text" name="Description" value={subjectData.Description} onChange={handleChange} placeholder="Description" required className="form-control" />
                            <select
                                name="Major"
                                value={subjectData.Major}
                                onChange={handleChange}
                                required
                                className="form-control"
                            >
                                <option value="">Select Major</option>
                                {majors.map((major) => (
                                    <option key={major._id} value={major._id}>
                                        {major.Name}
                                    </option>
                                ))}
                            </select>
                            <button type="submit" className="btn btn-success">{editId ? "Update" : "Create"} Subject</button>
                        </form>
                        <div className="table-wrap">
                            <table className="table">
                                <thead className="thead-primary">
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Major</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject, index) => (
                                            <tr key={subject._id}>
                                                <td>{index + 1}</td>
                                                <td>{subject.Name}</td>
                                                <td>{subject.Major ? subject.Major.Name : "No Major"}</td>
                                                <td>
                                                    <button className="btn btn-warning me-2" onClick={() => handleEdit(subject)}>Edit</button>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(subject._id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" className="text-center">No subjects found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
export default Subject;