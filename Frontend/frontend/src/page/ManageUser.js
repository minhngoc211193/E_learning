import React, {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import styles from '../page/ManageUser.module.css';
import axios from 'axios';
function ManageUser (){
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();
    useEffect(() => {

        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        
        try {
            const response = await axios.get('http://localhost:8000/user/users', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                }
             });
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users", error);
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
    <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Manage Account</h2>
            <div className="flex space-x-4 border-b pb-2">
                <span className="font-semibold border-b-2 border-black">All accounts</span>
                <span className="text-gray-500 cursor-pointer">Create account</span>
            </div>

            <div className="overflow-auto mt-4">
                <table className="min-w-full bg-gray-200 rounded-lg">
                    <thead>
                        <tr className="bg-gray-300">
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Username</th>
                            <th className="p-3 text-left">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} className="border-t">
                                <td className="p-3">{user.Fullname}</td>
                                <td className="p-3">{user.Role}</td>
                                <td className="p-3">{user.Username}</td>
                                <td className="p-3">
                                    <button onClick={() => navigate(`/detail-user/${user._id}`)} className="text-blue-500 mr-3">View</button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-500">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default ManageUser;