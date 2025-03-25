import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";


function CreateClass() {
    const [step, setStep] = useState(1);
    const [classData, setClassData] = useState({
        Classname: "",
        Major: "",
        Subject: "",
        Teacher: "",
        Student: [],
        Schedule: "",
        Document: "",
        Slot:""
    });

    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    console.log(classData)
    const [majors, setMajors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const token = localStorage.getItem("accessToken");

    useEffect(() => {
        fetchMajors();
    }, []);

    useEffect(() => {
        fetchSubjects(classData.Major);
        fetchTeachers(classData.Major);
        fetchStudents(classData.Major);
    }, [classData.Major]);



    const fetchMajors = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/major/majors`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMajors(response.data);
        } catch (e) {
            console.error("Error fetching majors", e);
        }
    };

    const fetchSubjects = async (majorId) => {
        if (!majorId) return;
        try {

            const response = await axios.get(`http://localhost:8000/subject/get-subjects-by-major/${majorId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubjects(response.data);
        } catch (e) {
            console.error("Error fetching subjects", e);
        }
    };

    const fetchStudents = async (majorId) => {

        try {
            const decoded = jwtDecode(token);
            const userRole = "student";
            if (!classData.Major) return;
            const response = await axios.get(`http://localhost:8000/user/users-by-major/${majorId}?Role=${userRole}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // const studentList = response.data.filter(user => user.role === "student");
            setStudents(response.data);
        } catch (e) {
            console.error("Error fetching students", e);
        }
    };

    const fetchTeachers = async (majorId) => {
        try{
            const decoded = jwtDecode(token);
            const userRole = "teacher"
            if(!classData.Major) return;
            const response = await axios.get(`http://localhost:8000/user/users-by-major/${majorId}?Role=${userRole}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response.data);
            // const teacherList = response.data.filter(user => user.role === "teacher");
            setTeachers(response.data);
        }catch(e){
            console.error("Error fetching teachers", e);
        }
    };

    const handleNext = () => setStep(2);
    const handlePre = () => setStep(1);

    const handleSubjectChange = (e) => {
        const selectedSubjectId = e.target.value;  // Lấy id của subject thay vì tên
        console.log("Selected Subject ID: " + selectedSubjectId);
        setClassData(prev => ({
            ...prev,
            Subject: selectedSubjectId,  // Lưu id của subject vào state
        }));
    };

    const handleCheckboxChange = (student) => {
        setClassData(prev => {
            const newStudentList = prev.Student.includes(student._id)
                ? prev.Student.filter(s => s !== student._id)  // Nếu học sinh đã có trong mảng, thì bỏ
                : [...prev.Student, student._id];  // Nếu học sinh chưa có trong mảng, thêm vào
            return {
                ...prev,
                Student: newStudentList
            };
        });
    };

    const handleTeacher = (teacher) => {
        setClassData (prev => ({
            ...prev,
            Student: teacher._id
        }));
    };
    const handleMajorChange = (e) => {
        const selectedMajor = e.target.value;
        console.log("Major: " + e);
        console.log(e.target.value);
        setClassData(prev => ({
            ...prev,
            Major: selectedMajor,
            Subject: "",
            Teacher: ""
        }));
        fetchSubjects(selectedMajor);
    };


    const handleSubmit = async () => {
        try {
            const simplifiedClassData = {
                Classname: classData.Classname,
                subjectId: classData.Subject,
                Student: classData.Student,
                Teacher: classData.Teacher,
                Slots: classData.Slot,
            };
            console.log("form gửi đi:"+ simplifiedClassData);

            await axios.post("http://localhost:8000/class/create-class", simplifiedClassData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate("/manageclass");
        } catch (e) {
            console.error("Error creating class", e);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold">Create new class</h1>
            <div className="mt-4">
                {step === 1 ? (
                    <div>
                        <label className="block mt-4">Class Name</label>
                        <input type="text" placeholder="Name" value={classData.Classname}
                            onChange={(e) => setClassData({ ...classData, Classname: e.target.value })}
                            className="border p-2 w-full" />
                        <br/>
                        <br/>
                        <label className="block mt-4">Slot</label>
                        <input type="text" placeholder="Slot" value={classData.Slot}
                            onChange={(e) => setClassData({ ...classData, Slot: e.target.value })}
                            className="border p-2 w-full" />
                        <label className="block mt-4">Major</label>
                        <select value={classData.Major} onChange={handleMajorChange} className="border p-2 w-full">
                            <option value="">Select Major</option>
                            {majors.map((major) => (
                                <option key={major._id} value={major._id}>{major.Name}</option>
                            ))}
                        </select>
                        <br/>
                        <br/>
                        <label className="block mt-4">Subject</label>
                        <select value={classData.Subject} onChange={handleSubjectChange}
                            className="border p-2 w-full" disabled={!classData.Major}>
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject._id} value={subject._id}>{subject.Name}</option>
                            ))}
                        </select>
                        <br/>
                        <br/>
                        <label className="block mt-4">Teacher</label>
                        <select value={classData.Teacher} onChange={(e) => setClassData({ ...classData, Teacher: e.target.value })}
                            className="border p-2 w-full" disabled={!classData.Major}>
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                                <option onClick={() => handleTeacher(teacher)}  key={teacher._id} value={teacher._id}>{teacher.Fullname}</option>
                            ))}
                        </select>
                        <br/>
                        <br/>
                        <button onClick={handleNext} className="mt-4 px-4 py-2 bg-blue-500 text-white">Next</button>
                    </div>
                ) : (
                    <div>
                        <input type="text" placeholder="Search student..." value={search}
                            onChange={(e) => setSearch(e.target.value)} className="border p-2 w-full" />


                    <div className="mt-2">
                            {students.filter(s => s.Fullname.toLowerCase().includes(search.toLowerCase())).map(student => (
                                <div key={student._id} className="flex justify-between border p-2 mt-2">
                                    <span>{student.Fullname}</span>
                                    <input
                                        type="checkbox"
                                        checked={classData.Student.includes(student._id)} // Kiểm tra nếu học sinh đã được chọn
                                        onChange={() => handleCheckboxChange(student)} // Thêm hoặc bỏ học sinh khi thay đổi trạng thái checkbox
                                        className="ml-4"
                                    />
                                </div>
                            ))}
                        </div>

                        <button onClick={handlePre} className="px-4 py-2 bg-gray-500 text-white">Back</button>
                        <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white">Create</button>
                    </div>
                )}
            </div>
        </div>
    );
}


export default CreateClass;
