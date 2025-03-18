import React, {useEffect, useState} from 'react';
import axios from 'axios';


function Document (){
    const [selectClass, setSelectClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [documentData, setDocumentData] = useState({
        Tittle:"",
        Description:"",
        File: null,
        Class: ""

    });
    const [userRole, setUserRole ] = useState(localStorage.getItem("Role"));
    const token = localStorage.getItem("accessToken");

    const fetchClasses = async() =>{
        try{
            const response = await axios.get("http://localhost:8000/class/classes", {
                headers: {Authorization: `Bearer ${token}`},
            });
            console.log("Classes data:", response.data);
            setClasses(response.data || []);
        }catch(e){
            console.error("Error fetching classes", e);
            setClasses([]);
        }
    };
    const fetchDocumentClass = async(classId) =>{
        try{
            const response = await axios.get(`http://localhost:8000/document/documents/class/${classId}`,{
                headers:{ Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data);
        }catch(e){
            console.error("Error fetching documents", e);

        }

    };

    const uploadDocument = async(e) =>{
        e.preventDefault();
        if(!documentData.File) 
            return alert ("Please select file to upload!");

        const formData = new formData();
        Object.entries(documentData).forEach(([key, value]) => {
            formData.append(key, value);
        });
        formData.append("ClassId", selectClass);

        try{
            await axios.post("http://localhost:8000/document/upload-document", formData, {
                
                headers:{ "Content-Type" : "multipart/form-data", 
                    Authorization: `Bearer ${token}` }
            });
            alert("Uoload file successful! ");
            fetchDocumentClass(selectClass);
        } catch(e){
            console.error("Error upload", e);
        }
    };

    const handleDelete = async (documentId) => {
        if (userRole !== "teacher") 
            return alert ("You do not have permission to delete the document!");
        try{
            await axios.delete(`http://localhost:8000/document/documents/${documentId}`, {
                headers: {Authorization: `Bearer ${token}`}
            });
            alert("Delete Successful!");
            fetchDocumentClass(selectClass);
        }catch(e){
            console.error("Error delete document", e);
        }
    };
    useEffect(() => {
        fetchClasses();
      }, []);
    useEffect(() => {

        if(selectClass){
            fetchDocumentClass(selectClass);
        }
    }, [selectClass]);

    return (
        <div className="flex h-screen">
        <div className="w-1/4 bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Lớp học</h2>
        {classes && Array.isArray(classes) && classes.length > 0 ? (
        classes.map((cls) => (
        <button
            key={cls._id}
            className={`block w-full text-left px-4 py-2 mb-2 rounded ${selectClass === cls._id ? "bg-gray-400" : "bg-gray-300"}`}
            onClick={() => setSelectClass(cls._id)}
        >
            {cls.Classname}
        </button>
    ))
  ) :[]}
      </div>
      <div className="w-3/4 p-6">
        <h2 className="text-2xl font-bold mb-4">{selectClass ? `Class ${selectClass}` : "Chọn lớp học"}</h2>
        <div className="mb-4 border p-4 rounded">
          <input type="text" placeholder="Tiêu đề" className="border p-2 mb-2 w-full" onChange={(e) => setDocumentData({ ...documentData, Title: e.target.value })} />
          <input type="text" placeholder="Mô tả" className="border p-2 mb-2 w-full" onChange={(e) => setDocumentData({ ...documentData, Description: e.target.value })} />
          <input type="file" onChange={(e) => setDocumentData({ ...documentData, file: e.target.files[0] })} />
          <button onClick={uploadDocument} className="bg-blue-500 text-white px-4 py-2 mt-2 rounded">Tải lên</button>
        </div>
        <h3 className="text-xl font-bold">Tài liệu</h3>
        <ul>
          {documents.map((document) => (
            <li key={document._id} className="border p-2 rounded my-2 flex justify-between">
              <span>{document.Tittle}</span>
              <div>
                <a href={`http://localhost:8000/document/download-document/${document._id}`} className="text-blue-500">Download</a>
                {userRole === "teacher" && (
                  <button onClick={() => handleDelete(document._id)} className="bg-red-500 text-white px-2 py-1 ml-2 rounded">Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default Document