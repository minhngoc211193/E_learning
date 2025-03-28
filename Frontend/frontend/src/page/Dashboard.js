import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import Menu from "../components/Menu";
import axios from "axios";

const Dashboard = () => {
  const [allClass, setAllClass] = useState([]);
  const [allSubject, setAllSubject] = useState([]);
  const [allMajor, setAllMajor] = useState([]);
  const [allBlog, setAllBlog] = useState([]);
  const [allUser, setAllUser] = useState([]);

  const fetAll = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.error("Bạn chưa đăng nhập!");
          return;
        }
        const resClasses = await axios.get(`http://localhost:8000/class/classes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resMajors = await axios.get(`http://localhost:8000/major/majors`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resSubject = await axios.get(`http://localhost:8000/subject/subjects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resBlogs = await axios.get(`http://localhost:8000/blog/blogs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const resUsers = await axios.get(`http://localhost:8000/user/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllClass(resClasses.data);
        setAllMajor(resMajors.data);
        setAllSubject(resSubject.data);
        setAllBlog(resBlogs.data);
        setAllUser(resUsers.data);
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng hoặc blog.", err);
      }
    };
  useEffect(() => {
    fetAll();
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <Menu />
      {/* Page Content */}
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>DASHBOARD</h1>
        </div>
        <div className={styles.center}>
          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Class</h3>
              <p>{allClass.length}</p>
            </div>
            <div className={styles.cardInforRight1}>
              <i class="fa-solid fa-book"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Major</h3>
              <p>{allMajor.length}</p>
            </div>
            <div className={styles.cardInforRight2}>
            <i class="fa-solid fa-school"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Subject</h3>
              <p>{allSubject.length}</p>
            </div>
            <div className={styles.cardInforRight3}>
            <i class="fa-solid fa-calculator"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Blog</h3>
              <p>{allBlog.length}</p>
            </div>
            <div className={styles.cardInforRight4}>
            <i class="fa-solid fa-blog"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Teacher</h3>
              <p>{allUser.filter((user) => user.Role === "teacher").length}</p>
            </div>
            <div className={styles.cardInforRight5}>
            <i class="fa-solid fa-person-chalkboard"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Student</h3>
              <p>{allUser.filter((user) => user.Role === "student").length}</p>
            </div>
            <div className={styles.cardInforRight6}>
            <i class="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <h2>Sidebar Navigation Example</h2>
          <p>The sidebar width is set with <code>width: 25%</code>.</p>
          <p>The left margin of the page content is set to the same value.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
