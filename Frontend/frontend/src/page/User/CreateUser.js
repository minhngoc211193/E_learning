import React from 'react';
import styles from '../CreateUser.module.css';
import {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
const CreateUser = ()=>{
    const [majors, setMajors] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {
      const token = localStorage.getItem("accessToken");
      if (token) {
          try {
              const decodedToken = JSON.parse(atob(token.split(".")[1])); // Giải mã token
              if (decodedToken.Role !== "admin") {
                  alert("You have to login!");
                  navigate("/home"); // Chuyển hướng về trang chủ
              }
          } catch (err) {
              console.error("Token không hợp lệ", err);
              navigate("/"); // Chuyển hướng nếu token lỗi
          }
      } else {
          alert("Bạn cần đăng nhập trước!");
          navigate("/home"); // Chuyển hướng đến trang login nếu chưa có token
      }
  }, [navigate]);
    useEffect(() => {
        
        const majors = async() =>{
            try {
                const response = await axios.get("http://localhost:8000/major/majors");
                setMajors(response.data); 
            }catch(err){
                console.log(err);
            }
        };
        majors();
    },[] )
    const [message, setMessage] = useState([]);
    const[userData, setUserData] = useState({
            Fullname: "",  
            Username: "",  
            Password: "",  
            Email: "",     
            PhoneNumber: "", 
            Role: "",   
            Gender: "",   
            DateOfBirth: "",
            Major: "",   

    });

    const handleChange = (e) => {
      setUserData((prevState) => ({
        ...prevState,  // Giữ nguyên dữ liệu cũ
        [e.target.name]: e.target.value
    }));
    };

    const handleSubmit = async (e) => {
        //call API
        e.preventDefault();
        console.log("Sending Data:", userData);
        try{
          const response =  await axios.post("http://localhost:8000/auth/register", userData, {
            headers: {
              "Content-Type": "application/json"
            },
          });

          console.log("Create new user", response.data);
          setUserData({
            Fullname: "",  
            Username: "",  
            Password: "",  
            Email: "",     
            PhoneNumber: "", 
            Role: "",   
            Gender: "",   
            DateOfBirth: "",
            Major: "",

          });

        }catch(e) {
          if(e.response && e.response.data.errors){
            setMessage(e.response.data.errors[0].msg);
          }
          console.error("Error registering user:", e);

        }
    };
    // console.log(userData);
    return(
        <div className={styles.createPage}>
        <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.tittle}>Manage Account</h1>
            <div className="tabs">
            <button className="tab active">Create Account</button>
            <button className="tab">All Account</button>
            </div>
        <div className={styles.formGrid}>
        <input
          type="text"
          name="Fullname"
          placeholder="Full Name"
          value={userData.Fullname}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <br/>
        <br/>
        <input
          type="text"
          name="Username"
          placeholder="Username"
          value={userData.Username}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <br/>
        <br/>
        <input
          type="password"
          name="Password"
          placeholder="Password"
          value={userData.Password}
          onChange={handleChange}
          className={styles.input}
          required
        />
         <br/>
         <br/>       
        <input
          type="email"
          name="Email"
          placeholder="Email"
          value={userData.Email}
          onChange={handleChange}
          className={styles.input}
          required
        />
         <br/>
         <br/>       
        <input
          type="tel"
          name="PhoneNumber"
          placeholder="Phone Number"
          value={userData.PhoneNumber}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <br/>
        <br/>
        <select
          name="Role"
          value={userData.Role}
          onChange={handleChange}
          className={styles.Select}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        
        {userData.Role === "student" || userData.Role === "teacher" ? (
              <select
                name="Major"
                value={userData.Major}
                onChange={handleChange}
                className="Select"
              >
                {majors.map((major) => (
                  <option key={major._id} value={major._id}>{major.Name}</option>
                ))}
              </select>
            ) : null}
        <br/>
        <br/>
        <select
          name="Gender"
          value={userData.Gender}
          onChange={handleChange}
          className={styles.Select}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <br/>
        <br/>
        <input
          type="date"
          name="DateOfBirth"
          value={userData.DateOfBirth}
          onChange={handleChange}
          className="Select"
          required
        />
        <br/>
        <br/>
        <button
          type="submit"
          className={styles.Create}
        >
          Create New User
        </button>
        </div>
      </form>
      {message &&<p>{message}</p>}
    </div>
    );
};
export default CreateUser;