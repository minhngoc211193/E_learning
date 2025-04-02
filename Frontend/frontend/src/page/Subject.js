import React, { useState, useEffect } from 'react';
import styles from '../page/Subject.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Subject() {
    const [subjectData, setSubjectData] = useState({ Name: "", Description: "", MajorId:"", CodeSubject:"" });
    const [userRole, setUserRole] = useState(null);
    const [majors, setMajors] = useState([]);
    const [userMajor, setUserMajor] = useState(null);
    const [subjects, setSubjects] = useState([]);
    const [editId, setEditId] = useState(null);
    const [selectedMajor, setSelectedMajor] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
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
            navigate("/");
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
            const response = await axios.get('http://localhost:8000/major/majors',{
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching majors", error);
        }
    };

    const fetchSubjects = async () => {
        try {
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

    //Create button
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        const requestData = {
            Name: subjectData.Name,
            Description: subjectData.Description,
            MajorId: subjectData.MajorId,
            CodeSubject: subjectData.CodeSubject 
        };
        
        try {

            if (editId) {
                await axios.put(`http://localhost:8000/subject/update-subject/${editId}`, requestData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post("http://localhost:8000/subject/create-subject", requestData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setSubjectData({ Name: "", Description: "", MajorId: "", CodeSubject: "" });
            setEditId(null);
            fetchSubjects();
        } catch (error) {
            console.error("Error saving subject", error);
        }
    };

    //Edit button
    const handleEdit = (subject) => {
        setSubjectData({ 
            Name: subject.Name, 
            Description: subject.Description, 
            MajorId: subject.Major ? subject.Major._id: "",
            CodeSubject:  subject.CodeSubject
        });
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
        <section className={styles.Subjectsection}>
            <div className={styles.container}>
                <h2 className={styles.headingSection}>Manage Subjects</h2>

                <h4 className={`${styles.textCenter} ${styles.mb4}`}>Filter by Major</h4>
                <select className={styles.formControl} value={selectedMajor} onChange={handleMajorFilterChange}>
                    <option value="">All Majors</option>
                    {majors.map((major) => (
                        <option key={major._id} value={major._id}>{major.Name}</option>
                    ))}
                </select>

                <h4 className={`${styles.textCenter} ${styles.mb4}`}>Subject Form</h4>
                <form onSubmit={handleSubmit} className={styles.subjectForm}>
                    <input type="text" name="Name" value={subjectData.Name} onChange={handleChange} placeholder="Subject Name" required className={styles.formControl} />
                    <input type="text" name="Description" value={subjectData.Description} onChange={handleChange} placeholder="Description" required className={styles.formControl} />
                    <input type="text" name="CodeSubject" value={subjectData.CodeSubject} onChange={handleChange} placeholder="Subject Code" required className={styles.formControl} />
                    <select
                        name="MajorId"
                        value={subjectData.MajorId}
                        onChange={handleChange}
                        required
                        className={styles.formControl}
                    >
                        <option value="">Select Major</option>
                        {majors.map((major) => (
                            <option key={major._id} value={major._id}>
                                {major.Name}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>
                        {editId ? "Update" : "Create"} Subject
                    </button>
                </form>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead className="thead-primary">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Major</th>
                                <th>Code Subject</th>
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
                                        <td>{subject.CodeSubject}</td>
                                        <td>
                                            <button className={`${styles.btn} ${styles.btnWarning} ${styles.me2}`} onClick={() => handleEdit(subject)}>Edit</button>
                                            <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => handleDelete(subject._id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className={styles.textCenter}>No subjects found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
export default Subject;