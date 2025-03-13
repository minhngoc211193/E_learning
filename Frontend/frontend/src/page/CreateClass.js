import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

function CreateClass (){
    const {step, setStep} = useState(1);
    const {classData, setClassData} = useState({
        Classname: "",
        Major:"",
        Subject:"",
        Teacher: "",
        Student: [],
        Schedule:"",
        Document:"",
        Assignment:"" 
    });
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const token = localStorage.getItem("accessToken");
    const [majors, setMajors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        fetchMajors();
        fetchStudents();
    }, []);
    const fetchMajors = async() =>{
        try{
            const response = await axios.get(`https://localhost:8000/major/majors`, {
                headers: {Authorization:`Bearer ${token}`},
            });        
        }catch(e){
            console.error("Error fetching majors", e);
        }
    }
    const fetchStudents = async() => {
        try{
            const response = await axios.get(`https://localhost:8000/student/students`, {
                headers: {Authorization: `Bearer ${token}`},

            });
            setStudents(response.data);
        }catch (e){
            console.error("Error fetching students", e);
        }
    };
    const handleNext = () => setStep(2);
    const handlePre = () => setStep(1);

    const handleMajorChange = (e) => {
        const selectedMajor = e.target.value;
        setClassData(prev => ({
            ...prev,
            Major: selectedMajor,
            Subject: "",
            Teacher:""
        }));
        if (selectedMajor){
            
        }
    }
    const handleStudent = (student) =>{
        setClassData(prev => ({...prev, students: [...prev.students, student]}));
    };

    const handleRemoveStudent = (id) => {
        setClassData(prev => ({ ...prev, students: prev.students.filter(student => student._id !== id)}));
    };

    const handleSubmit = async () => {
        try{
            await axios.post("https://localhost:8000/class/create-class", classData, {
                headers: {Authorization: `Bearer ${token}`}
        });
        }catch(e){
                console.error("Error create class", e);
        }
    };



    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold">Create new class</h1>
            <div className="mt-4">
                {step === 1 ? (
                    <div>
                        <label className="block mt-4">Class Name</label>
                        <input type="text" placeholder="Name" value={classData.Name} 
                        onChange={(e) => setClassData({...classData, name: e.target.value})} 
                        className="border p-2 w-full" />
                        <label className="block mt-4">Major</label>
                        <select value={classData.Major} onChange={handleMajorChange} className="border p-2 w-full">
                            <option value="">Select Major</option>
                            {majors.map((major) => (
                                <option key={major._id} value={major.Name}>{major.Name}</option>
                            ))}
                        </select>
                        <label className="block mt-4">Subject</label>
                        <select value={classData.Subject} onChange={(e) => setClassData({...classData, subject: e.target.value})} className="border p-2 w-full" disabled={!classData.major}>
                            <option value="">Select Subject</option>
                            {subjects.map((subject) => (
                                <option key={subject._id} value={subject.Name}>{subject.Name}</option>
                            ))}
                        </select>

                        <label className="block mt-4">Teacher</label>
                        <select value={classData.Teacher} onChange={(e) => setClassData({...classData, teacher: e.target.value})} className="border p-2 w-full" disabled={!classData.major}>
                            <option value="">Select Teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                            ))}
                        </select>

                        <button onClick={handleNext} 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white">Next</button>
                    </div>
                ) : (
                    <div>
                        <input type="text" placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)} className="border p-2 w-full" />
                        <div className="mt-2">
                            {students.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(student => (
                                <div key={student._id} className="flex justify-between border p-2 mt-2">
                                    <span>{student.Fullname}</span>
                                    <button onClick={() => handleStudent(student)} className="px-2 py-1 bg-green-500 text-white">Add</button>
                                </div>
                            ))}
                        </div>
                        <h2 className="mt-4 text-xl">Selected Students</h2>
                        <ul>
                            {classData.students.map(student => (
                                <li key={student._id} className="flex justify-between p-2 border mt-2">
                                    {student.Fullname}
                                    <button onClick={() => handleRemoveStudent(student._id)} className="px-2 py-1 bg-red-500 text-white">Remove</button>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4 flex space-x-2">
                            <button onClick={handlePre} className="px-4 py-2 bg-gray-500 text-white">Back</button>
                            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white">Create</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    
}
export default CreateClass;