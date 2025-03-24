import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditClass() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [classData, setClassData] = useState({ Classname: '', Subject: '' });
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchClassDetails();
        fetchSubjects();
    }, []);

    const fetchClassDetails = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.log("No Access");
            navigate("/login");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:8000/class/detail-class/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClassData(response.data);
        } catch (e) {
            console.error("Error fetching class details", e);
        }
    };

    const fetchSubjects = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            console.error("No Access");
            return;
        }
        try {
            const response = await axios.get("http://localhost:8000/subject/subjects", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubjects(response.data);
        } catch (e) {
            console.error("Error fetching subjects", e);
        }
    };

    const handleChange = (e) => {
        setClassData({ ...classData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("accessToken");
        try {
            await axios.put(`http://localhost:8000/class/update-class/${id}`, classData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Successfully updated class");
            navigate("/manageclass");
        } catch (e) {
            console.error("Error updating class", e);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Edit Class</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold">Class Name</label>
                    <input
                        type="text"
                        name="Classname"
                        value={classData.Classname}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold">Subject</label>
                    <select
                        name="Subject"
                        value={classData.Subject}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject._id} value={subject._id}>{subject.Name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-4">
                    <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Update</button>
                    <button type="button" onClick={() => navigate('/manage-class')} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
                </div>
            </form>
        </div>
    );
}

export default EditClass;
