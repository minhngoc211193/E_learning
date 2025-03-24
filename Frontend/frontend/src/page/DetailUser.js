import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DetailUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserDetail = async () => {
            const token = localStorage.getItem("accessToken");
            try {
                const response = await axios.get(`http://localhost:8000/user/detail-user/${id}`, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);
            } catch (err) {
                setError("Lỗi khi tải thông tin người dùng");
            } finally {
                setLoading(false);
            }
        };
        fetchUserDetail();
    }, [id]);

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p>{error}</p>;
    if (!user) return <p>Không tìm thấy người dùng</p>;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            {user.Image && (
                <img 
                    src={`data:image/jpeg;base64,${user.Image}`} 
                    alt="User Avatar"
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-300 shadow-sm"
                />
            )}
            <p><strong>Họ và tên:</strong> {user.Fullname}</p>
            <p><strong>Tên đăng nhập:</strong> {user.Username}</p>
            <p><strong>Số điện thoại:</strong> {user.PhoneNumber}</p>
            <p><strong>Giới tính:</strong> {user.Gender}</p>
            <p><strong>Ngày sinh:</strong> {new Date(user.DateOfBirth).toLocaleDateString()}</p>
            <p><strong>Role:</strong> {user.Role}</p>
            <p><strong>Chuyên ngành:</strong> {user.Major?.Name || "Chưa có dữ liệu"}</p>
            {user.Role === "student" && <p><strong>Năm học:</strong> {user.SchoolYear}</p>}

            <div className="mt-6 text-center">
                <button 
                    className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    onClick={()=> (navigate(`/update-user/${user._id}`))}
                >
                    Edit
                </button>
            </div>
        </div>
    );
};

export default DetailUser;