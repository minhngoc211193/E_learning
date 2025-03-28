import React, { useEffect, useState, useRef } from 'react';

import axios from 'axios';
import styles from "./Document.module.css";
import { jwtDecode } from "jwt-decode";

function Document() {
    const [selectClass, setSelectClass] = useState(null);
    const [classes, setClasses] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [documentData, setDocumentData] = useState({
        Tittle: "",
        Description: "",
        file: null
    });
    const [editingDocument, setEditingDocument] = useState(null);
    const fileInputRef = useRef(null); // <-- Thêm ref để reset file input
    const token = localStorage.getItem("accessToken");
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        if (!token) {
            console.error("No access token found");
            return;
        }   

        try {
            const decoded = jwtDecode(token);
            const userId = decoded?.id;
            if (!userId) {
                console.error("Invalid token: userId not found");
                return;
            }
            if (!decoded?.Role) {
                console.error("Invalid token: Role not found");
                return;
            }
            setUserRole(decoded.Role);
            fetchClasses(userId);
        } catch (error) {
            console.error("Error decoding token", error);
        }
    }, []);

    useEffect(() => {
        if (selectClass) {
            setDocuments([]);
            fetchDocuments(selectClass);
        }
    }, [selectClass]);

    const fetchClasses = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:8000/class/class-by-userId/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("User ID:", userId);
            setClasses(response.data);
        } catch (e) {
            console.error("Error fetching classes", e);
        }
    };

    const fetchDocuments = async (classId) => {
        try {
            const response = await axios.get(`http://localhost:8000/document/documents/class/${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data.documents || []);
        } catch (e) {
            console.error("Error fetching documents", e);
        }
    };

    const uploadDocument = async (e) => {
        e.preventDefault();

        if (userRole !== "teacher" && userRole !== "admin") {
            alert("Bạn không có quyền tải lên tài liệu!");
            return;
        }
        const formData = new FormData();
        formData.append("file", documentData.file);
        formData.append("Tittle", documentData.Tittle);
        formData.append("Description", documentData.Description);
        formData.append("ClassId", selectClass);
        console.log("File chọn:", documentData.file);
        try {
            await axios.post("http://localhost:8000/document/upload-document", formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            alert("Upload thành công!");
            setDocumentData({ 
                Tittle: "", 
                Description: "", 
                file: null 
            });
            // Reset input file bằng ref
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Xóa giá trị file đã chọn
            }
            fetchDocuments(selectClass);
        } catch (e) {
            console.error("Lỗi tải lên", e);
        }
    };

    const updateDocument = async (e) => {
        e.preventDefault();
        if (userRole !== "teacher" && userRole !== "admin") {
            alert("Bạn không có quyền sửa tài liệu!");
            return;
        }
        try {

            await axios.put(`http://localhost:8000/document/update-document/${editingDocument._id}`, documentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Cập nhật thành công!");
            setEditingDocument(null);
            setDocumentData({ 
                Tittle: "", 
                Description: "", 
                file: null 
            });
            // Reset input file bằng ref
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Xóa giá trị file đã chọn
            }
            fetchDocuments(selectClass);
        } catch (e) {
            console.error("Lỗi cập nhật", e);
        }
    };
    useEffect(() => {
        if (editingDocument) {
            setDocumentData({
                Tittle: editingDocument.Tittle || "",
                Description: editingDocument.Description || "",
                file: null, 
            });
        }
    }, [editingDocument]);

    const handleDelete = async (documentId) => {

        if (userRole !== "teacher" && userRole !== "admin") 
            return alert("Bạn không có quyền xóa tài liệu!");
        try {
            await axios.delete(`http://localhost:8000/document/delete-document/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Xóa thành công!");
            fetchDocuments(selectClass);
        } catch (e) {
            console.error("Lỗi xóa tài liệu", e);
        }
    };
    return (
        <div className={styles.container}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
            <h2 className={styles.logo}>LOGO</h2>
            {classes.map(cls => (
                <button
                    key={cls._id}
                    className={`className={styles["class-button"]} ${selectClass === cls._id ? "selected" : ""}`}
                    onClick={() => setSelectClass(cls._id)}
                >
                    {cls.Classname}
                </button>
            ))}
        </div>

        {/* Main Content */}
        <div className={styles.content}>
            <div className={styles["class-header"]}>
                <h2 className={styles["class-title"]}>{selectClass ? `Class ${classes.find(cls => cls._id === selectClass)?.Classname || ""}` : "Chọn lớp học"}</h2>
            </div>

            {/* Form Upload */}
            {selectClass && (userRole === "teacher" || userRole === "admin") && (
                <div className={styles["document-form"]}>
                    <input
                        type="text"
                        placeholder="Tiêu đề"
                        value={documentData.Tittle}
                        onChange={(e) => setDocumentData({ ...documentData, Tittle: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Mô tả"
                        value={documentData.Description}
                        onChange={(e) => setDocumentData({ ...documentData, Description: e.target.value })}
                    />
                    <input type="file" ref={fileInputRef} onChange={(e) => setDocumentData({ ...documentData, file: e.target.files[0] })} />
                    {editingDocument ? (
                        <button className={styles["edit-button"]}  onClick={updateDocument}>Cập nhật</button>
                    ) : (
                        <button className={styles["upload-button"]} onClick={uploadDocument}>Tải lên</button>
                    )}
                </div>
            )}

            {/* Danh sách tài liệu */}
            <h3 className={styles["document-title"]}>Tài liệu</h3>
            <ul className={styles["document-list"]}>
                {documents.map(document => (
                    <li key={document._id} className={styles["document-item"]}>
                        <span>{document.Tittle}</span>
                        <div>
                            {userRole ==="student" && (
                                <a href={`http://localhost:8000/document/download-document/${document._id}`} 
                            className={styles["download-link"]}>Download</a>)}
                            
                            { (userRole === "teacher" || userRole === "admin") &&(
                                <>
                                    <button 
                                        className={styles["edit-button"]} 
                                        onClick={() => {
                                            setEditingDocument(document);
                                            setDocumentData({ 
                                                Tittle: document.Tittle, 
                                                Description: document.Description, 
                                                file: null 
                                            });
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        className={styles["delete-button"]} 
                                        onClick={() => handleDelete(document._id)}
                                    >
                                        ❌ Delete
                                    </button>
                                </>
                            )}
                        </div>

                    </li>
                ))}
            </ul>
        </div>
    </div>
    );
}
export default Document;
