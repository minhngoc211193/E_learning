import React, {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import { FaEye, FaTrash } from "react-icons/fa";
import styles from '../page/ManageUser.module.css';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CreateUser from '../page/User/CreateUser';

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
    <div className={styles.container}>
            <h2 >Manage Account</h2>
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
            </select>
                <span className={activeTab ==="create"? styles.activeTab : styles.inactiveTab}
                        onClick={() => setActiveTab("create")} >
                            Create account</span>
            </div>
            {activeTab ==="all" ? (
            <div className={styles["table-container"]}>
                <table className={styles.table}>
                    <thead>
                        <tr >
                            <th >Name</th>
                            <th >Role</th>
                            <th >Username</th>
                            <th >Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} >
                                <td >{user.Fullname}</td>
                                <td >{user.Role}</td>
                                <td >{user.Username}</td>
                                <td >
                                    <button onClick={() => navigate(`/detail-user/${user._id}`)} className={styles["action-button"]}><FaEye /></button>
                                    <button onClick={() => handleDelete(user._id)} className={styles["delete-button"]}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>) :(
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
    );
}
export default ManageUser;