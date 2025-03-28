import React, {useState, useEffect} from 'react';
import { useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "./ManageClass.module.css";
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
            await axios.delete( `http://localhost:8000/class/delete-class/${id}`,{
                headers: {Authorization: `Bearer ${token}`}
            });
            setClasses(classes.filter(classItem => classItem._id !== id));
        }catch(e){
            console.error("Error deleting class", e);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>All Class</h1>
                <button className={styles["create-btn"]} onClick={() => navigate("/create-class")}>
                    Create new class
                </button>
            </div>
            <div>
                <input
                    type="text"
                    placeholder="Enter here..."
                    value={search}
                    onChange={handleSearch}
                    className={styles["search-box"]}
                />
            </div>
            <div className={styles["grid-container"]}>
                {filteredClasses.map((classItem) => (
                    <div key={classItem._id} className={styles["class-card"]}>
                        <h2 className={styles["class-title"]}>{classItem.Classname}</h2>
                        <p>{classItem.Subject?.Name}</p>
                        <div className={styles.avatar}>👤</div>
                        <div className={styles["button-group"]}>
                            <button
                                className={styles["edit-btn"]}
                                onClick={() => navigate(`/update-class/${classItem._id}`)}
                            >
                                Edit
                            </button>
                            <button className={styles["delete-btn"]} onClick={() => handleDelete(classItem._id)}>
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