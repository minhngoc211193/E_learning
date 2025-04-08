import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import styles from './CreateClass.module.css';
import Menu from '../components/Menu'


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
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchMajors();
    }, []);

    useEffect(() => {
        fetchSubjects(classData.Major);
        fetchTeachers(classData.Major);
        if (classData.Major && classData.Subject) {
            fetchStudentsBySubject(classData.Major, classData.Subject);
        }
    }, [classData.Major,classData.Subject]);



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

    const fetchStudentsBySubject = async (majorId, subjectId) => {
        if (!majorId || !subjectId) return;
        try {
            const response = await axios.get(`http://localhost:8000/user/users-by-subject?majorId=${majorId}&subjectId=${subjectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(response.data);
        } catch (e) {
            console.error("Error fetching students by subject", e);
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
            Teacher: teacher._id
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
            if (e.response && e.response.data.errors) {
                setMessage(e.response.data.errors[0].message);
            }
            console.error("Error creating class", e);
        }
    };
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className={styles.pageContainer}>
         {/* Nút Hamburger hiển thị chỉ trên mobile */}
      <div className={styles.hamburgerBar}>
        <button
          className={styles.hamburgerBtn}
          onClick={() => setShowMenu(!showMenu)}
        >
          &#9776;
        </button>
      </div>

      {/* Sidebar: Menu */}
      <div
        className={`${styles.sidebar} ${showMenu ? styles.showSidebar : ""}`}
      >
        <Menu />
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>Create new class</h1>
        
        <div className={styles["mt-4"]}>
          {step === 1 ? (
            <div>
              <label className={`${styles.block} ${styles["mt-4"]}`}>Class Name</label>
              <input
                type="text"
                placeholder="Name"
                value={classData.Classname}
                onChange={(e) => setClassData({ ...classData, Classname: e.target.value })}
                className={styles["input-field"]}
              />
              
              <label className={`${styles.block} ${styles["mt-4"]}`}>Slot</label>
              <input
                type="text"
                placeholder="Slot"
                value={classData.Slot}
                onChange={(e) => setClassData({ ...classData, Slot: e.target.value })}
                className={styles["input-field"]}
              />

              <label className={`${styles.block} ${styles["mt-4"]}`}>Major</label>
              <select
                value={classData.Major}
                onChange={handleMajorChange}
                className={styles["select-field"]}
              >
                <option value="">Select Major</option>
                {majors.map((major) => (
                  <option key={major._id} value={major._id}>
                    {major.Name}
                  </option>
                ))}
              </select>

              <label className={`${styles.block} ${styles["mt-4"]}`}>Subject</label>
              <select
                value={classData.Subject}
                onChange={handleSubjectChange}
                className={styles["select-field"]}
                disabled={!classData.Major}
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.Name}
                  </option>
                ))}
              </select>

              <label className="block mt-4">Teacher</label>
              <select
                value={classData.Teacher}
                onChange={(e) => setClassData({ ...classData, Teacher: e.target.value })}
                className={styles["select-field"]}
                disabled={!classData.Major}
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option
                    onClick={() => handleTeacher(teacher)}
                    key={teacher._id}
                    value={teacher._id}
                  >
                    {teacher.Fullname}
                  </option>
                ))}
              </select>

              <button onClick={handleNext} className={`${styles.button} ${styles["button-blue"]}`}>
                Next
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Search student..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles["input-field"]}
              />

              <div className={styles["student-list"]}>
                {students
                  .filter((s) =>
                    s.Fullname.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((student) => (
                    <div key={student._id} className={styles["student-item"]}>
                      <span>{student.Fullname}</span>
                      <input
                        type="checkbox"
                        checked={classData.Student.includes(student._id)}
                        onChange={() => handleCheckboxChange(student)}
                      />
                    </div>
                  ))}
              </div>

              <button onClick={handlePre} className={`${styles.button} ${styles["button-gray"]}`}>
                Back
              </button>
              <button onClick={handleSubmit} className={`${styles.button} ${styles["button-blue"]}`}>
                Create
              </button>
              {message && <p>{message}</p>}
            </div>
          )}
        </div>
      </div>
    </div>

    );
}


export default CreateClass;
