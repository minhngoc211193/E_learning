import React, {useState, useEffect} from 'react';
import { useNavigate} from "react-router-dom";
import axios from "axios";
function ManageClass (){
    const [classes, setClasses] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await axios.get("http://localhost:8000/class/classes");
            setClasses(response.data);
        }catch (e) {
            console.error("Error fetching classes", e);
        }
    }
    const filteredClasses = classes.filter(classItem => 
        classItem.Classname.toLowerCase().includes(search.toLowerCase())
    );
    const handleSearch = (e) => {
        setSearch(e.target.value);
    };
    const handleDelete = async (id) =>{
        const token = localStorage.getItem("accessToken");
        if(!window.confirm("Are you sure you want to delete this class?")) 
            return;
        try{
            await axios.delete(`hppts://localhost:80000/class/delete-class/${id}`,{
                headers: {Authorization: `Bearer ${token}`}
            });
            setClasses(classes.filter(classItem => classItem._id !== id));
        }catch(e){
            console.error("Error deleting class", e);
        }
    };

    return (
        <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Class</h1>
            <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={() => navigate("/create-class")}
            >
                Create new class
            </button>
        </div>
        <div className="mb-4">
            <input 
                type="text" 
                placeholder="Enter here..." 
                value={search} 
                onChange={handleSearch}
                className="border p-2 rounded w-full"
            />
        </div>
        <div className="grid grid-cols-3 gap-4">
            {filteredClasses.map((classItem) => (
                <div key={classItem._id} className="bg-gray-200 p-4 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold">{classItem.Classname}</h2>
                    <p>{classItem.Subject?.Name}</p>
                    <div className="mt-4 flex items-center">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex justify-center items-center">
                            <span className="text-white">👤</span>
                        </div>
                        {/* <p className="ml-2">{classItem.Teacher?.Fullname}</p> */}
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                            <button 
                                className="px-3 py-1 bg-green-500 text-white rounded" 
                                onClick={() => navigate(`/edit-class/${classItem._id}`)}
                            >
                                Edit
                            </button>
                            <button 
                                className="px-3 py-1 bg-red-500 text-white rounded" 
                                onClick={() => handleDelete(classItem._id)}
                            >
                                Delete
                            </button>
                    </div>  
                </div>
            ))}
        </div>
    </div>

    );

}
export default ManageClass;