import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './DetailMajor.module.css';
import Menu from '../components/Menu';

function DetailMajor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [major, setMajor] = useState(null);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {

    fetchMajor();
    fetchUserByMajor();
    fetchSubjectByMajor();
  }, [id, navigate, token]);
  const fetchMajor = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/major/detail-major/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMajor(res.data);
    } catch (error) {
      console.error('Error fetching major detail:', error);
      navigate('/majors');
    }
  };
  const fetchUserByMajor = async () => {
    try{
        const response = await axios.get(`http://localhost:8000/user/users-by-major/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        setUsers(response.data);
    } catch (e){
        console.error('Error fetching users in major:', e);
        navigate('/majors');
    }
  }
  const fetchSubjectByMajor = async()=>{
    try{
        const response = await axios.get(`http://localhost:8000/subject/get-subjects-by-major/${id}`,{
            headers: { Authorization: `Bearer ${token}` }
        })
        setSubjects(response.data);
    }catch(e){
        console.error('Error fetching subject in major:', e);
        navigate('/majors');
    }
  }

  if (!major) {
    return <div className={styles.loading}>Loading major details...</div>;
  }

  return (
    <div className={styles.body}>
      <Menu />
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{major.Name}</h2>
          <p><strong>Description:</strong> {major.Description}</p>
          <p><strong>Code:</strong> {major.CodeMajor}</p>
        </div>

        <div className={styles.usersSection}>
            <h3>Users in this Major</h3>
            {users && users.length > 0 ? (
                <div className={styles.userGrid}>
                {users.map((user) => (
                    <div key={user._id} className={styles.userCard}>
                    <img
                        src={user.Image || '/default-avatar.png'}
                        alt={user.Fullname}
                        className={styles.userImage}
                    />
                    <div className={styles.userInfo}>
                        <h4>{user.Fullname}</h4>
                        <p><strong>Email:</strong> {user.Email}</p>
                        <p><strong>Role:</strong> {user.Role}</p>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                <p>No users assigned to this major.</p>
            )}
        </div>
        <div className={styles.subjectsSection}>
            <h3>Subjects in this Major</h3>
            {subjects && subjects.length > 0 ? (
                <div className={styles.subjectGrid}>
                {subjects.map((subject) => (
                    <div key={subject._id} className={styles.subjectCard}>
                    <h4>{subject.Name}</h4>
                    <p><strong>Code:</strong> {subject.CodeSubject}</p>
                    <p><strong>Description:</strong> {subject.Description}</p>
                    </div>
                ))}
                </div>
            ) : (
                <p>No subjects assigned to this major.</p>
            )}
            </div>


        <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
}

export default DetailMajor;
