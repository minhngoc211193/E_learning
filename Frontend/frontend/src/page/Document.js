import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from "./Document.module.css";
import { jwtDecode } from "jwt-decode";
import { saveAs } from 'file-saver';
import { notification } from "antd";


function Document({ classId: externalClassId }) {
    const [selectClass, setSelectClass] = useState(externalClassId || null);
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
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (type, detailMessage = "") => {
        if (type === "success") {
            api.open({
                message: "Upload file successfully!",
                description: "File has been uploaded successfully.",
                showProgress: true,
                pauseOnHover: true,
            });
        } else {
            api.open({
                message: "Upload file failed!",
                description: detailMessage,
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };

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
    useEffect(() => {
        if (externalClassId) {
            setSelectClass(externalClassId);
        }
    }, [externalClassId]);

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
            openNotification("error", "You are not allow!");
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
            openNotification("success", "Upload successfully!");
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
            const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };

    const updateDocument = async (e) => {
        e.preventDefault();
        if (userRole !== "teacher" && userRole !== "admin") {
            openNotification("error", "You are not allow!");
        }
        try {

            await axios.put(`http://localhost:8000/document/update-document/${editingDocument._id}`, documentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openNotification("success", "Update success!");
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
            const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
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
            openNotification("error", "You are not allow delete document!");
        try {
            await axios.delete(`http://localhost:8000/document/delete-document/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            openNotification("success", "Delete success!");
        } catch (e) {
            console.error("Error delete document", e);
            const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };
    const handleDownload = async (documentId) => {
        if (userRole !== "student") {
            openNotification("error", "You are not allow download document!");
        }

        try {
            const response = await axios.get(`http://localhost:8000/document/download-document/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Đảm bảo phản hồi là blob (tệp nhị phân)
            });

            const contentDisposition = response.headers['content-disposition'];

            // Kiểm tra contentDisposition có tồn tại và có đúng định dạng hay không
            if (contentDisposition && contentDisposition.includes('filename="')) {
                const matches = contentDisposition.match(/filename="([^"]+)"/);
                const filename = matches && matches[1] ? matches[1] : 'default_filename';  // Tên mặc định nếu không tìm thấy
                saveAs(response.data, filename);
            } else {
                // Nếu không có filename, sử dụng tên mặc định
                saveAs(response.data, 'default_filename');
            }
        } catch (e) {
            console.error("Lỗi khi download", e);
            const errorMessage = e.response?.data?.message || "Have problem, plase try again!";
            openNotification("error", errorMessage);
        }
    };



    return (
        <div className={styles.container}>
            {contextHolder}
            {!externalClassId && (
                <div className={styles.sidebar}>
                    {classes.map(cls => (
                        <button
                            key={cls._id}
                            className={`${styles["class-button"]} ${selectClass === cls._id ? styles.selected : ""}`}
                            onClick={() => setSelectClass(cls._id)}
                        >
                            {cls.Classname}
                        </button>
                    ))}
                </div>
            )}

            {/* Main Content */}
            <div className={styles.content}>
                <div className={styles["class-header"]}>
                    <h2 className={styles["class-title"]}>
                        {selectClass ? `Class ${classes.find(cls => cls._id === selectClass)?.Classname || ""}` : "Chọn lớp học"}
                    </h2>
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => setDocumentData({ ...documentData, file: e.target.files[0] })}
                        />
                        {editingDocument ? (
                            <button className={styles["edit-button"]} onClick={updateDocument}>Update</button>
                        ) : (
                            <button className={styles["upload-button"]} onClick={uploadDocument}>Upload</button>
                        )}
                    </div>
                )}

                {/* Danh sách tài liệu */}
                <h3 className={styles["document-title"]}>Document</h3>
                <ul className={styles["document-list"]}>
                    {documents.length > 0 ? (
                        documents.map(document => {
                            const documentId = document._id;
                            return (
                                <li key={document._id} className={styles["document-item"]}>
                                    <span>{document.Tittle}</span>
                                    <div>
                                        {userRole === "student" && (
                                            <button

                                                className={styles["download-button"]}
                                                onClick={() => handleDownload(document._id)} // Correctly passing document._id here
                                            >
                                                Download
                                            </button>
                                        )}

                                        {(userRole === "teacher") && (
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
                            )
                        })
                    ) : (
                        <li className={styles["document-item"]}>No documents available</li>
                    )}
                </ul>
            </div>
        </div>

    );
}
export default Document;
