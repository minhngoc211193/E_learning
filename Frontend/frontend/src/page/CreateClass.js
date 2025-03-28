import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from "./CreateClass.module.css";


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
        <div className={styles.container}>
            <h1>Create new class</h1>
            <div className={styles["form-group"]}>
                {step === 1 ? (
                    <>
                        <label>Class Name</label>
                        <input type="text" name="Classname" value={classData.Classname} onChange={(e) => setClassData({ ...classData, Classname: e.target.value })} />

                        <label>Slot</label>
                        <input type="text" name="Slot" value={classData.Slot} onChange={(e) => setClassData({ ...classData, Slot: e.target.value })} />

                        <label>Major</label>
                        <select name="Major" value={classData.Major} onChange={handleMajorChange}>
                            <option value="">Select Major</option>
                            {majors.map((major) => <option key={major._id} value={major._id}>{major.Name}</option>)}
                        </select>

                        <label>Subject</label>
                        <select name="Subject" value={classData.Subject} onChange={handleSubjectChange} disabled={!classData.Major}>
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => <option key={subject._id} value={subject._id}>{subject.Name}</option>)}
                        </select>

                        <label >Teacher</label>
                        <select value={classData.Teacher} onChange={(e) => setClassData({ ...classData, Teacher: e.target.value })}
                             disabled={!classData.Major}>
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                                <option onClick={() => handleTeacher(teacher)}  key={teacher._id} value={teacher._id}>{teacher.Fullname}</option>
                            ))}
                        </select>

                        <button className={styles["btn-next"]} onClick={() => setStep(2)}>Next</button>
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} />

                        <div className={styles["student-list"]}>
                            {students.filter((s) => s.Fullname.toLowerCase().includes(search.toLowerCase())).map((student) => (
                                <div key={student._id} className={styles["student-item"]}>
                                    <span>{student.Fullname}</span>
                                    <input type="checkbox" checked={classData.Student.includes(student._id)} onChange={() => handleCheckboxChange(student._id)} />
                                </div>
                            ))}
                        </div>

                        <button className={styles["btn-back"]} onClick={() => setStep(1)}>Back</button>
                        <button className={styles["btn-next"]} onClick={handleSubmit}>Create</button>
                    </>
                )}
            </div>
        </div>
    );
}


export default CreateClass;
