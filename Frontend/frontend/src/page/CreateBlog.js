import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Upload, Spin, notification} from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./CreateBlog.module.css";
import backgroundImg from "../assets/abc.jpg";
import Header from "../components/Header";

function CreateBlog() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [api, contextHolder] = notification.useNotification();

    const openNotification = (type, detailMessage = "") => {
        if (type === "success") {
            api.open({
                message: "Create blog successful!",
                description: "Your blog has been created successfully.",
                showProgress: true,
                pauseOnHover: true,
            });
        } else {
            api.open({
                message: "Create blog failed!",
                description: detailMessage,
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };

    // Dummy request để ngăn Upload tự động gửi file
    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const handleBeforeUpload = (file) => {
        const isValidType =
            file.type === "image/jpeg" ||
            file.type === "image/png" ||
            file.type === "image/jpg";
        if (!isValidType) {
            openNotification("error", "You only upload file image (jpg, jpeg, png)!");
            return Upload.LIST_IGNORE;
        }
        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            openNotification("error", "FIle size smaller 3MB!");
            return Upload.LIST_IGNORE;
        }
        setFile(file);
        const preview = URL.createObjectURL(file);
        setPreviewImage(preview);
        return false; // Ngăn upload tự động
    };

    const handleUploadChange = (info) => {
        if (info.file.status === "uploading") {
            setLoading(true);
            return;
        }
        if (info.file.status === "done" || info.file.status === "error") {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !content.trim() || !file) {
            openNotification("error", "Please fill in all fields!");
            return;
        }
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                openNotification("error", "You are not logged in!");
                return;
            }
            const decoded = jwtDecode(token);
            const userId = decoded.id;

            const formData = new FormData();
            formData.append("Title", title);
            formData.append("Content", content);
            formData.append("User", userId);
            formData.append("Image", file);

            await axios.post(
                "http://localhost:8000/blog/create-blog",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            openNotification("success");
            setTitle("");
            setContent("");
            setFile(null);
            setPreviewImage("");
            setTimeout(() => navigate("/profile"), 2000);
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Have problem when create blog!";
            openNotification("error", errorMessage);
        }
    };

    return (
        <div>
            <Header />
            {contextHolder}
            <div
                className={styles.backGround}
                style={{ backgroundImage: `url(${backgroundImg})` }}
            >
                <div className={styles.createNewBlogContainer}>
                    <h2 className={styles.heading}>Create New Blog</h2>
                    <form className={styles.createNewBlogForm} onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className={styles.formGroup}>
                            <label htmlFor="title">Title</label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Write your title here..."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        {/* Content */}
                        <div className={styles.formGroup}>
                            <label htmlFor="content">Content</label>
                            <textarea
                                id="content"
                                placeholder="Write your content here..."
                                className={styles.content}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </div>

                        {/* Upload Image */}
                        <div className={styles.formGroup}>
                            <label>Upload Image</label>
                            <Upload
                                name="Image"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false}
                                beforeUpload={handleBeforeUpload}
                                customRequest={dummyRequest}
                                onChange={handleUploadChange}
                            >
                                {previewImage ? (
                                    <img
                                        className={styles.previewImage}
                                        src={previewImage}
                                        alt="preview"
                                        style={{ width: "100%" }}
                                    />
                                ) : (
                                    <div>
                                        {loading ? (
                                            <Spin indicator={<LoadingOutlined />} />
                                        ) : (
                                            <PlusOutlined />
                                        )}
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        </div>
                        <button type="submit" className={styles.submitButton}>
                            Create
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateBlog;
