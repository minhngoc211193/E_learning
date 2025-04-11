import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DetailClass.module.css'; // CSS module for styling
import Document from './Document';
import { jwtDecode } from "jwt-decode";
import Menu from '../components/Menu';
import Header from '../components/Header';

function DetailClass() {
  const { id } = useParams(); // Get the class ID from URL params
  const [classData, setClassData] = useState(null); // Store class data
  const [error, setError] = useState(null);
  const token = localStorage.getItem("accessToken");
  const decoded = jwtDecode(token);
  const role = decoded?.Role;
  const navigate = useNavigate();

  // Fetch class data from the server
  useEffect(() => {
    fetchClassData(); // Call function to fetch class data
  }, [id,]);

  const fetchClassData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/class/detail-class/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClassData(response.data); // Set the class data
    } catch (err) {
      setError("Cannot get class information."); // Set error message
    }
  };

  // Show an error message if there is an error
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Check if classData is loaded
  if (!classData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={role === "admin" ? styles.body : styles.bodyUser}>
      {role === "admin" ? <Menu /> : <Header />}
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.title}>{classData.Classname}</h1>
        <div className={styles.details}>
          <div className={styles.info}>
            <h2>Major:</h2>
            <p>{classData.Subject.Major.Name}</p>
          </div>
          <div className={styles.info}>
            <h2>Subject: {classData.Subject.Name}</h2>
            <p>{classData.Subject.Description}</p>
          </div>

          <div className={styles.info}>
            <h2>Teacher:</h2>
            <p>{classData.Teacher.Fullname}</p>
          </div>

          <div className={styles.info}>
            <h2>Students:</h2>
            <ul>
              {classData.Student.map((student) => (
                <li key={student._id}>{student.Fullname}</li>
              ))}
            </ul>
          </div>
        </div>
        <br />
        {(role === "teacher" || role === "student") && (
          <div className={styles.document}>
            <h2>Document in class:</h2>
            <Document classId={id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailClass;
