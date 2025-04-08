import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditClass.module.css";
import { jwtDecode } from 'jwt-decode';
import Header from '../components/Header';

const EditClass = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState({
    Classname: "",
    Major: "",
    Subject: "",
    Teacher: "",
    Slot: "",
    Students: [],
  });
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // Lấy thông tin lớp học
  const fetchClassInfo = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const decoded = jwtDecode(token);
      if (decoded.Role !== "admin") {
        showMessage("Bạn không có quyền chỉnh sửa lớp!", "error");
        navigate("/");
        return;
      }
      const res = await axios.get(`http://localhost:8000/class/detail-class/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setClassData({
          Classname: res.data.Classname || "",
          Major: res.data.Subject.Major._id || "",
          Subject: res.data.Subject._id || "",
          Teacher: res.data.Teacher._id || "",
          Slot: res.data.Slots || "",
          Students: res.data.Student.map((student) => student) || [],
        });
      }
    } catch (e) {
      showMessage("Không thể lấy thông tin lớp học.", e);
    }
  };

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  // Lấy danh sách majors, subjects, teachers, students
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (classData.Major) {
      axios
        .get(`http://localhost:8000/subject/get-subjects-by-major/${classData.Major}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setSubjects(res.data));

      axios
        .get(`http://localhost:8000/user/users-by-major/${classData.Major}?Role=teacher`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTeachers(res.data));

      axios
        .get(`http://localhost:8000/user/users-by-major/${classData.Major}?Role=student`, {
            // search user
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setStudents(res.data));
    }

    axios.get("http://localhost:8000/major/majors", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => setMajors(res.data));
  }, [classData.Major]);

  // Xử lý thay đổi giá trị trong form
  const handleChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  const handleStudentChange = (studentId) => {
    setClassData((prevState) => {
      // Kiểm tra học sinh đã có trong lớp chưa
      const isStudentInClass = prevState.Students.some((classStudent) => classStudent._id === studentId);
      
      // Nếu học sinh đã có trong lớp, bỏ học sinh khỏi lớp
      // Nếu học sinh chưa có trong lớp, thêm học sinh vào lớp
      const newStudents = isStudentInClass
        ? prevState.Students.filter((classStudent) => classStudent._id !== studentId) // Xóa học sinh khỏi lớp
        : [...prevState.Students, { _id: studentId }]; // Thêm học sinh vào lớp (chỉ cần thêm _id)
  
      return { ...prevState, Students: newStudents };
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      Classname: classData.Classname,
    //   Major: classData.Major,
      subjectId: classData.Subject,
      Teacher: classData.Teacher,
      Student: classData.Students.map((student) => student._id), 
      Slots: classData.Slot,
    };

    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(`http://localhost:8000/class/update-class/${classId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      showMessage("Cập nhật lớp học thành công", "success");
      navigate(`/manageclass`);
    } catch (error) {
      showMessage(`Lỗi cập nhật lớp học: ${error.response?.data?.message || error.message}`, "error");
    }
  };

  return (
    <div className={styles.createPage}>
      <Header />
      {message && <p className={`${styles.message} ${messageType === "error" ? styles.error : styles.success}`}>{message}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Edit Class</h1>
        <div className={styles.formGrid}>
          <input
            type="text"
            name="Classname"
            placeholder="Class Name"
            value={classData.Classname}
            onChange={handleChange}
            className={styles.input}
            required
          />
            <div className={styles.select}>
                 <span>{majors.find((major) => major._id === classData.Major)?.Name || "N/A"}</span>
            </div>
            <select
            name="Subject"
            value={classData.Subject}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.Name}
              </option>
            ))}
          </select>
          <select
            name="Teacher"
            value={classData.Teacher}
            onChange={handleChange}
            className={styles.select}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.Fullname}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="Slot"
            placeholder="Slot"
            value={classData.Slot}
            onChange={handleChange}
            className={styles.input}
            required
          />
            <div className={styles.students}>
  <h3>Students</h3>
  {students.map((student) => (
    <div key={student._id} className={styles.studentItem}>
      <input
        type="checkbox"
        checked={classData.Students.some((classStudent) => classStudent._id === student._id)} // Sử dụng .some để kiểm tra sự tồn tại của học sinh trong lớp
        onChange={() => handleStudentChange(student._id)}  // Xử lý sự kiện thay đổi khi click
        // disabled={classData.Students.includes(student._id)} // Nếu học sinh đã có trong lớp, không thể thay đổi
      />
      <span>{student.Fullname}</span>
    </div>
  ))}
</div>


          <button type="submit" className={styles.create}>
            Update Class
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditClass;
