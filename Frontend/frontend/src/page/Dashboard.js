import React, { useEffect, useState, useRef, useCallback } from "react";
import styles from "./Dashboard.module.css";
import Menu from "../components/Menu";
import axios from "axios";
import Chart from "chart.js/auto";
import createSocket from './Socket';

const Dashboard = () => {
  const [allClass, setAllClass] = useState([]);
  const [allSubject, setAllSubject] = useState([]);
  const [allMajor, setAllMajor] = useState([]);
  const [allBlog, setAllBlog] = useState([]);
  const [allUser, setAllUser] = useState([]);
  const chartRefStudent = useRef(null);
  const chartRefTeacher = useRef(null);
  const chartRefClass = useRef(null);
  const chartRefSubject = useRef(null);
  const chartRefBlog = useRef(null);
  const chartRefMessages = useRef(null);
  const chartRefStudentStatus = useRef(null);
  const chartInstanceStudentRef = useRef(null);
  const chartInstanceTeacherRef = useRef(null);
  const chartInstanceClassRef = useRef(null);
  const chartInstanceSubjectRef = useRef(null);
  const chartInstanceBlogRef = useRef(null);
  const [selectedDays, setSelectedDays] = useState(28);
  const chartInstanceMessagesRef = useRef(null);
  const [selectedDaysMessage, setSelectedDaysMessage] = useState(28);
  const chartInstanceStudentStatusRef = useRef(null);
  const token = localStorage.getItem("accessToken");

  const fetAll = useCallback(async () => {
    try {
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
  }, [token]);


  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const updateChartStudentsByMajor = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/students-by-major", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data;
        const labels = data.map((item) => item.major);
        const counts = data.map((item) => item.count);
        const backgroundColors = data.map(() => getRandomColor());
  
        if (chartInstanceStudentRef.current) {
          chartInstanceStudentRef.current.destroy();
        }
  
        chartInstanceStudentRef.current = new Chart(chartRefStudent.current, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: counts,
                backgroundColor: backgroundColors,
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: "right"
              },
              title: {
                display: true,
                text: "Number of students by major"
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.chart.data.labels[context.dataIndex] || "";
                    const value = context.raw;
                    const datasetData = context.chart.data.datasets[0].data;
                    const total = datasetData.reduce((sum, current) => sum + current, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                    return `${label}: ${percentage}% (${value})`;
                  }
                }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  },[token]);
  

  const updateChartClassesBySubject = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/classes-by-subject", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data;
        const labels = data.map((item) => item.subject);
        const counts = data.map((item) => item.count);
        const backgroundColors = data.map(() => getRandomColor());
  
        if (chartInstanceClassRef.current) {
          chartInstanceClassRef.current.destroy();
        }
  
        chartInstanceClassRef.current = new Chart(chartRefClass.current, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Number of classes by subject",
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: "Number of classes"
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Subjects"
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: "Number of classes by subject"
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.dataset.label || "";
                    const value = context.raw;
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  },[token]);
  

  const updateChartSubjectsByMajor = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/subjects-by-major", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data;
        const labels = data.map((item) => item.major);
        const counts = data.map((item) => item.count);
        const backgroundColors = data.map(() => getRandomColor());
  
        if (chartInstanceSubjectRef.current) {
          chartInstanceSubjectRef.current.destroy();
        }
  
        chartInstanceSubjectRef.current = new Chart(chartRefSubject.current, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Number of subject by major",
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: "Number of subject"
                }
              },
              x: {
                title: {
                  display: true,
                  text: "Major"
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              title: {
                display: true,
                text: "Number of subject by major"
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.dataset.label || "";
                    const value = context.raw;
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  },[token]);
  

  const updateChartTeachersByMajor = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/teachers-by-major", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data;
        const labels = data.map((item) => item.major);
        const counts = data.map((item) => item.count);
        const backgroundColors = data.map(() => getRandomColor());
  
        if (chartInstanceTeacherRef.current) {
          chartInstanceTeacherRef.current.destroy();
        }
  
        chartInstanceTeacherRef.current = new Chart(chartRefTeacher.current, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [
              {
                data: counts,
                backgroundColor: backgroundColors,
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "right" },
              title: {
                display: true,
                text: "Number of teachers by major"
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.chart.data.labels[context.dataIndex] || "";
                    const value = context.raw;
                    const datasetData = context.chart.data.datasets[0].data;
                    const total = datasetData.reduce((sum, current) => sum + current, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                    return `${label}: ${percentage}% (${value})`;
                  }
                }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu:", error));
  },[token]);


  const updateChartBlogByDay = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/blog-by-day", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data; // [{ date: "YYYY-MM-DD", count: number }, ...]
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filteredData = data.slice(-selectedDays);
        const labels = filteredData.map((item) => item.date);
        const counts = filteredData.map((item) => item.count);
        
        // Nếu chart đã tồn tại, hủy nó để tạo mới
        if (chartInstanceBlogRef.current) {
          chartInstanceBlogRef.current.destroy();
        }
        
        // Tạo biểu đồ đường mới
        chartInstanceBlogRef.current = new Chart(chartRefBlog.current, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Number of Blogs Posted Per Day",
              data: counts,
              fill: false,
              borderColor: "#36A2EB",
              backgroundColor: "#36A2EB",
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: "Day" }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: "Blog Number" },
                ticks: { stepSize: 1 }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu blog:", error));
  },[token, selectedDays]);
  

  const updateChartMessagesByDay = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/messages-by-day", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const data = response.data; // [{ date: "YYYY-MM-DD", count: number }, ...]
        data.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filteredData = data.slice(-selectedDaysMessage);
        const labels = filteredData.map((item) => item.date);
        const counts = filteredData.map((item) => item.count);
  
        // Nếu biểu đồ đã tồn tại thì hủy nó trước khi tạo mới
        if (chartInstanceMessagesRef.current) {
          chartInstanceMessagesRef.current.destroy();
        }
  
        chartInstanceMessagesRef.current = new Chart(chartRefMessages.current, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Number of messages sent per day",
              data: counts,
              fill: false,
              borderColor: "#FF6384",
              backgroundColor: "#FF6384",
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: "top" },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `${context.dataset.label}: ${context.parsed.y}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: { display: true, text: "Day" }
              },
              y: {
                beginAtZero: true,
                title: { display: true, text: "Number of messages" },
                ticks: { stepSize: 1 }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu tin nhắn:", error));
  },[token, selectedDaysMessage]);
  

  const updateChartStudentStatus = useCallback(async () => {
    axios
      .get("http://localhost:8000/dashboard/students-class-status", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((response) => {
        const { studentsWithClass, studentsWithoutClass } = response.data;
        const labels = ["Students have classes", "Students do not have a class yet."];
        const counts = [studentsWithClass, studentsWithoutClass];
        const backgroundColors = ["#36A2EB", "#FF6384"];
  
        if (chartInstanceStudentStatusRef.current) {
          chartInstanceStudentStatusRef.current.destroy();
        }
  
        chartInstanceStudentStatusRef.current = new Chart(chartRefStudentStatus.current, {
          type: "pie",
          data: {
            labels: labels,
            datasets: [{
              data: counts,
              backgroundColor: backgroundColors,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: "right" },
              title: { display: true, text: "Student class status" },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || "";
                    const value = context.parsed;
                    return `${label}: ${value}`;
                  }
                }
              }
            }
          }
        });
      })
      .catch((error) => console.error("Lỗi khi lấy dữ liệu trạng thái lớp học:", error));
  },[token]);


  useEffect(() => {
    fetAll();
    updateChartStudentsByMajor();
    updateChartClassesBySubject();
    updateChartSubjectsByMajor();
    updateChartTeachersByMajor();
    updateChartMessagesByDay();
    updateChartStudentStatus();
    updateChartBlogByDay();
    const socket = createSocket();
    socket.on("newClass", (newClass) => {
      setAllClass((prevClasses) => [...prevClasses, newClass]);
      updateChartClassesBySubject();
      updateChartStudentStatus();
    });
    socket.on("deleteClass", (deletedClassId) => {
      setAllClass((prevClasses) =>
        prevClasses.filter((classItem) => classItem._id !== deletedClassId)
      );
      updateChartClassesBySubject();
      updateChartStudentStatus();
    });
    socket.on("newMajor", (newMajor) => {
      setAllMajor((prevMajors) => [...prevMajors, newMajor]);
      updateChartStudentsByMajor();
      updateChartSubjectsByMajor();
      updateChartTeachersByMajor();
      updateChartClassesBySubject();
    });
    socket.on("deleteMajor", (deletedMajorId) => {
      setAllMajor((prevMajors) =>
        prevMajors.filter((major) => major._id !== deletedMajorId)
      );
      updateChartStudentsByMajor();
      updateChartSubjectsByMajor();
      updateChartTeachersByMajor();
      updateChartClassesBySubject();
    });
    socket.on("newSubject", (newSubject) => {
      setAllSubject((prevSubjects) => [...prevSubjects, newSubject]);
      updateChartClassesBySubject();
      updateChartSubjectsByMajor();
    });
    socket.on("deleteSubject", (deletedSubjectId) => {
      setAllSubject((prevSubjects) =>
        prevSubjects.filter((subject) => subject._id !== deletedSubjectId)
      );
      updateChartClassesBySubject();
      updateChartSubjectsByMajor();
    });
    socket.on("newBlog", (newBlog) => {
      setAllBlog((prevBlogs) => [...prevBlogs, newBlog]);
      updateChartBlogByDay();
    });
    socket.on("deleteBlog", (deletedBlogId) => {
      setAllBlog((prevBlogs) =>
        prevBlogs.filter((blog) => blog._id !== deletedBlogId)
      );
      updateChartBlogByDay();
    });
    socket.on("newUser", (newUser) => {
      setAllUser((prevBlogs) => [...prevBlogs, newUser]);
      updateChartStudentsByMajor();
      updateChartTeachersByMajor();
    });
    socket.on("deleteUser", (deletedUserId) => {
      setAllUser((prevUsers) =>
        prevUsers.filter((user) => user._id !== deletedUserId)
      );
      updateChartStudentsByMajor();
      updateChartTeachersByMajor();
    });
    socket.on("dashboard new message", (message) => {
      updateChartMessagesByDay();
    });
    return () => {
      socket.disconnect();
    };
  }, [fetAll, updateChartStudentsByMajor, updateChartClassesBySubject, updateChartSubjectsByMajor, updateChartTeachersByMajor, updateChartMessagesByDay, updateChartStudentStatus, updateChartBlogByDay]);
  

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
              <i className="fa-solid fa-book"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Major</h3>
              <p>{allMajor.length}</p>
            </div>
            <div className={styles.cardInforRight2}>
              <i className="fa-solid fa-school"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Subject</h3>
              <p>{allSubject.length}</p>
            </div>
            <div className={styles.cardInforRight3}>
              <i className="fa-solid fa-calculator"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Blog</h3>
              <p>{allBlog.length}</p>
            </div>
            <div className={styles.cardInforRight4}>
              <i className="fa-solid fa-blog"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Teacher</h3>
              <p>{allUser.filter((user) => user.Role === "teacher").length}</p>
            </div>
            <div className={styles.cardInforRight5}>
              <i className="fa-solid fa-person-chalkboard"></i>
            </div>
          </div>

          <div className={styles.cardInfor}>
            <div className={styles.cardInforLeft}>
              <h3>Student</h3>
              <p>{allUser.filter((user) => user.Role === "student").length}</p>
            </div>
            <div className={styles.cardInforRight6}>
              <i className="fa-solid fa-graduation-cap"></i>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.chartContainer}>
            <canvas className={styles.chart1} ref={chartRefStudent} />
            <canvas className={styles.chart2} ref={chartRefTeacher} />
          </div>
          <div className={styles.chartContainer}>
            <canvas className={styles.chart7} ref={chartRefStudentStatus} />
          </div>
          <div className={styles.chartContainer}>
            <canvas className={styles.chart3} ref={chartRefClass} />
            <canvas className={styles.chart4} ref={chartRefSubject} />
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chart5Buttons}>
              <span className={styles.headdingChart}>Number of Blogs posted in the last
                <select value={selectedDays} onChange={(e) => setSelectedDays(Number(e.target.value))}>
                  <option value={7}> 7 </option>
                  <option value={14}> 14 </option>
                  <option value={28}> 28 </option>
                </select>days
              </span>
              <canvas className={styles.chart5} ref={chartRefBlog} />
            </div>
          </div>
          <div className={styles.chartContainer}>
            <div className={styles.chart6Buttons}>
              <span className={styles.headdingChart}>Number of messages sent in the last
                <select value={selectedDaysMessage} onChange={(e) => setSelectedDaysMessage(Number(e.target.value))}>
                  <option value={7}> 7 </option>
                  <option value={14}> 14 </option>
                  <option value={28}> 28 </option>
                </select>days
              </span>
              <canvas className={styles.chart6} ref={chartRefMessages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
