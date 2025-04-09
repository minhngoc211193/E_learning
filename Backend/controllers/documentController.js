const Document = require('../models/Document');
const Class = require('../models/Class');
const User = require('../models/User');
const mime = require('mime-types');  


const documentController = {
    createDocument: async (req, res) => {
        try {
            const { Tittle, Description, ClassId } = req.body;
            const file = req.file;
            const userId = req.user.id;
        
            if (file) {
                const maxSize = 5 * 1024 * 1024; // 3MB
                if (file.size > maxSize) {
                    return res.status(400).json({ message: 'File size exceeded limit (3MB)' });
                }
            }
        
            const mimeType = mime.lookup(file.originalname);  // Lấy loại MIME của tệp từ tên tệp
            if (!mimeType) {
                return res.status(400).json({ message: 'File type could not be determined.' });
            }
        
            const user = await User.findById(userId);
            const classData = await Class.findById(ClassId);
        
            if (!user || user.Role !== 'teacher' || !classData || classData.Teacher.toString() !== userId) {
                return res.status(403).json({ message: 'Only the teacher of this class can create documents.' });
            }
        
            const createDocument = new Document({
                Tittle,
                Description,
                Class: ClassId,
                File: {
                    data: req.file.buffer,  // Lưu trữ dữ liệu tệp dưới dạng Buffer
                    mimeType,               // Lưu trữ loại MIME của tệp
                    originalName: file.originalname,  // Lưu tên gốc của tệp
                }
            });
        
            await createDocument.save();
            return res.status(200).json({ message: 'File upload successful' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error uploading file', error });
        }
    },
    
    

    // API để lấy tài liệu theo lớp
    getDocumentsByClass: async (req, res) => {
        try {
            const classId = req.params.classId;
            const userId = req.user.id;  // Lấy thông tin người dùng từ `req.user.id`

            const user = await User.findById(userId);
            const classData = await Class.findById(classId);

            if (!user || !classData || !classData.Student.includes(userId) && !classData.Teacher.equals(userId)) {
                return res.status(403).json({ message: 'Chỉ học sinh của lớp này mới có thể xem tài liệu' });

            }

            const documents = await Document.find({ Class: classId });
            if (!documents || documents.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy tài liệu cho lớp này' });
            }
            res.status(200).json({ documents });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error while retrieving document', error });
        }
    },

    // API để tải xuống tài liệu
    downloadDocument: async (req, res) => {
        try {
            const documentId = req.params.documentId;
            const userId = req.user.id;
        
            const document = await Document.findById(documentId);
            const classData = await Class.findById(document.Class);
        
            if (!document) {
                return res.status(404).json({ message: 'Document does not exist' });
            }
        
            const user = await User.findById(userId);
            if (!user || !classData || !classData.Student.includes(userId)) {
                return res.status(403).json({ message: 'Only students in this class can download documents.' });
            }
        
            // Lấy phần mở rộng từ MIME type
            const extension = mime.extension(document.File.mimeType);
            if (!extension) {
                return res.status(400).json({ message: 'File extension could not be determined.' });
            }
        
            // Giải mã dữ liệu base64 và chuyển nó thành một Buffer
            const fileBuffer = Buffer.from(document.File.data, 'base64');
        
            // Đặt các header HTTP để tải tệp về với tên và định dạng đúng
            res.setHeader('Content-Disposition', `attachment; filename="${document.File.originalName}"`);
            res.setHeader('Content-Type', document.File.mimeType);  // Loại MIME cho tệp
        
            // Gửi dữ liệu file
            res.send(fileBuffer);  // Trả về dữ liệu file dưới dạng buffer
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi tải tài liệu', error });
        }
    },
    
    

    updateDocument: async (req, res) => {
        try {
            const documentId = req.params.documentId;
            const { Tittle, Description } = req.body;
            const userId = req.user.id;  // Lấy thông tin người dùng từ `req.user.id`

            const document = await Document.findById(documentId);
            const classData = await Class.findById(document.Class);
            if (!classData) {
                return res.status(404).json({ message: 'Class does not exist' });
            }
            if (!document) {
                return res.status(404).json({ message: 'Document does not exist' });
            }

            const user = await User.findById(userId);
            if (!user || classData.Teacher.toString() !== userId) {
                return res.status(403).json({ message: 'Only the teacher of this class can edit the document.' });
            }

            document.Tittle = Tittle || document.Tittle;
            document.Description = Description || document.Description;

            if (req.file) {
                const maxSize = 5 * 1024 * 1024; // 3MB
                if (req.file.size > maxSize) {
                    return res.status(400).json({ message: 'File size exceeded limit (3MB)' });
                }
    
                const mimeType = mime.lookup(req.file.originalname);
                if (!mimeType) {
                    return res.status(400).json({ message: 'File type could not be determined.' });
                }
    
                // Cập nhật lại file mới cho tài liệu
                document.File = {
                    data: req.file.buffer,  // Lưu trữ dữ liệu file dưới dạng Buffer
                    mimeType,               // Lưu trữ loại MIME của tệp
                    originalName: req.file.originalname  // Lưu tên gốc của tệp
                };
            }


            await document.save();
            return res.status(200).json({ message: 'Document updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error while editing document', error });
        }
    },

    deleteDocument: async (req, res) => {
        try {
            const documentId = req.params.documentId;
            const userId = req.user.id;
    
            // Tìm tài liệu trong cơ sở dữ liệu
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ message: 'Document does not exist' });
            }
    
            // Tìm lớp tương ứng với tài liệu
            const classData = await Class.findById(document.Class);
    
            if (!classData) {
                return res.status(404).json({ message: 'Class does not exist' });
            }
    
            
    
            // Xóa tài liệu khỏi cơ sở dữ liệu
            await Document.findByIdAndDelete(documentId);
    
            return res.status(200).json({ message: 'Document deleted successfully' });
    
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error while deleting document', error });
        }
    },

    searchDocument: async (req, res) => {
        try{
            const { search } = req.query;
            if (!search) {
                return res.status(400).json({ message: 'Please enter search keyword' });
            }
            
            const documents = await Document.find({ Tittle: { $regex: search, $options: 'i' } });

            if (!documents || documents.length === 0) {
                return res.status(404).json({ message: 'Document not found' });
            }
            return res.status(200).json({ documents });
        } catch (error) {
            return res.status(500).json({ message: 'Error while searching for Document', error });
        }
    }
}

module.exports = documentController;