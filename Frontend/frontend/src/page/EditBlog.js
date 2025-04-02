import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Upload, notification } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import styles from "./EditBlog.module.css";
import backgroundImg from "../assets/abc.jpg";

function EditBlog() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const openNotification = useCallback((type, detailMessage = "") => {
    if (type === "success") {
      api.open({
        message: "Cập nhật blog thành công!",
        description: "Bài viết của bạn đã được cập nhật thành công.",
        showProgress: true,
        pauseOnHover: true,
      });
    } else {
      api.open({
        message: "Cập nhật blog thất bại!",
        description: detailMessage,
        showProgress: true,
        pauseOnHover: true,
      });
    }
  }, [api]); 

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
      openNotification("error", "Bạn chỉ có thể tải lên file (jpg, jpeg, png)!");
      return Upload.LIST_IGNORE;
    }
    // Nếu muốn giới hạn kích thước file là 1MB:
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      openNotification("error", "Kích thước file phải nhỏ hơn 3MB!");
      return Upload.LIST_IGNORE;
    }
    setFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
    return false; // Ngăn upload tự động
  };

  const handleUploadChange = (info) => {
    // Khi file được chọn (status uploading hay done)
    if (info.file.status === "uploading") return;
    if (info.file.status === "done" || info.file.status === "error") {
      // Không cần xử lý gì thêm vì đã cập nhật file ở handleBeforeUpload
    }
  };

  // Lấy dữ liệu blog cũ từ backend
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          openNotification("error", "Bạn chưa đăng nhập!");
          return;
        }
        const res = await axios.get(`http://localhost:8000/blog/detail-blog/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTitle(res.data.Title);
        setContent(res.data.Content);
        if (res.data.Image) {
          setPreviewImage(res.data.Image);
        }
      } catch (err) {
        openNotification("error", "Không thể tải blog. Vui lòng thử lại!");
      }
    };
    fetchBlog();
  }, [id, openNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      openNotification("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        openNotification("error", "Bạn chưa đăng nhập!");
        return;
      }
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      // Sử dụng FormData để gửi dữ liệu và file ảnh nếu có
      const formData = new FormData();
      formData.append("Title", title);
      formData.append("Content", content);
      formData.append("User", userId);
      if (file) {
        formData.append("Image", file);
      }

      await axios.put(
        `http://localhost:8000/blog/update-blog/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      openNotification("success");
      setTimeout(() => navigate(`/profile`), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!";
      openNotification("error", errorMessage);
    }
  };

  return (
    <div>
      {contextHolder}
      <div className={styles.backButton} onClick={() => navigate("/profile")}>
        <span><i class="fa-solid fa-arrow-left"></i></span>
      </div>
      <div
        className={styles.backGround}
        style={{ backgroundImage: `url(${backgroundImg})` }}>
        <div className={styles.editBlogContainer}>
          <h2 className={styles.heading}>Edit Blog</h2>
          <form className={styles.editBlogForm} onSubmit={handleSubmit}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Content */}
            <div className={styles.formGroup}>
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
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
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>
            <button type="submit" className={styles.submitButton}>Save</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
