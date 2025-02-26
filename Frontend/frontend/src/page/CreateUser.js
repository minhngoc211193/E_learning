import React from 'react';
import styles from './CreateUser.module.css';
import {useState, Navigate, useEffect} from 'react';
import axios from 'axios';
const CreateUser = ()=>{
    const [majors, setMajors] = useState([]);
    useEffect(() => {
        const majors = async() =>{
            try {
                const response = await axios.get("http://localhost:8000/majors");
                setMajors(response.data); 
            }catch(err){
                console.log(err);
            }
        };
        majors();
    })
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
        setUserData({userData, [e.target.name]: e.target.value});
    };

    const handleSubmit = (e) => {
        //call API
        e.preventDefault();
        console.log("New user was created", userData, setUserData);
    };
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
          name="fullName"
          placeholder="Full Name"
          value={userData.FullName}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <br/>
        <br/>
        <input
          type="text"
          name="username"
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
          name="password"
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
          name="email"
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
          name="phoneNumber"
          placeholder="Phone Number"
          value={userData.PhoneNumber}
          onChange={handleChange}
          className={styles.input}
          required
        />
        <br/>
        <br/>
        <select
          name="role"
          value={userData.role}
          onChange={handleChange}
          className={styles.Select}
          required
        >
          <option value="">Select Role</option>
          <option value="admin">Admin</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        
        {userData.role === "student" || userData.role === "teacher" ? (
          <input
            type="text"
            name="major"
            placeholder="Major"
            value={userData.Major}
            onChange={handleChange}
            className={styles.input}
          />
        ) : null}
        <br/>
        <br/>
        <select
          name="gender"
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
          name="dateOfBirth"
          value={userData.DateOfBirth}
          onChange={handleChange}
          className=""
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
    </div>
    );
};
export default CreateUser;