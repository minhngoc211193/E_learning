import React, {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import styles from '../page/ManageUser.module.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CreateUser from '../page/User/CreateUser';
import Menu from '../components/Menu';

function ManageUser (){
    const [users, setUsers] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [selectMajor, setSelectMajor] = useState("");
    const [majors, setMajors] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if(token){
            const decoded = jwtDecode(token);
            const role = decoded.Role; 
            setUserRole(role);

            if (role !== "admin") {
                navigate("/home");
                return;
            }
        }
        fetchMajors();
        fetchUsers();
    }, []);
    const fetchMajors= async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const response = await axios.get('http://localhost:8000/major/majors', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
             });
            setMajors(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };
    const fetchUsers = async () => {
        const token = localStorage.getItem("accessToken");
        try {
            const decoded = jwtDecode(token);
            const role = decoded.Role; // Ensure the token contains 'role'
            setUserRole(role);

            if (role !== "admin") {
                navigate("/home");
                return;
            }
            const response = await axios.get('http://localhost:8000/user/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
             });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const fetchUserByMajor = async(id) =>{
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(`http://localhost:8000/user/users-by-major/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
             });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users by major", error);
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`http://localhost:8000/user/delete-user/${id}`, { 
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                 });
                setUsers(users.filter(user => user._id !== id));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className={styles.body}>
      <Menu />
          <div className={styles.container}>
            <h2>Manage Account</h2>
            <div className={styles.nav}>
                <select
                    className={styles.filterDropdown}
                    value={selectMajor}
                    onChange={(e) => {
                        setSelectMajor(e.target.value);
                        if (e.target.value) {
                            fetchUserByMajor(e.target.value);
                        } else {
                            fetchUsers();
                        }
                    }}
                >
                    <option value="">All accounts</option>
                    {majors.map((major) => (
                        <option key={major._id} value={major._id}>
                            {major.Name}
                        </option>
                    ))}
                    <option value=""></option>
                </select>
                <span className={activeTab ==="create"? styles.activeTab : styles.inactiveTab}
                        onClick={() => setActiveTab("create")} >
                            Create account</span>
            </div>
            
            {activeTab === "all" ? (
                <div className={styles.userGrid}>
                    {users.map(user => (
                        <div key={user._id} className={styles.userCard} onClick={() => navigate(`/detail-user/${user._id}`)}>
                        <div className={styles.imageContainer}>
                        <button 
                            className={styles.deleteButton} 
                            onClick={(e) => {
                                e.stopPropagation(); 
                                handleDelete(user._id);
                            }}
                        >
                            X
                        </button>
                            <img src={user.Image || "/default-avatar.png"} alt={user.Fullname} className={styles.avatar} />
                        </div>
                        <div className={styles.userInfo}>
                            <h3 className={styles.username}>{user.Fullname}</h3>
                            <p className={styles.userRole}>Role: {user.Role}</p>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button 
                            className={styles.closeButton} 
                            onClick={() => setActiveTab("all")}
                        >
                            ✖
                        </button>
                        <CreateUser setActiveTab={setActiveTab} />
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}
export default ManageUser;