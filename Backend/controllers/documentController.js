const Document = require('../models/Document');
const Class = require('../models/Class');
const User = require('../models/User');

const documentController = {
    createDocument: async (req, res) => {
        try {
            const { Tittle, Description, ClassId } = req.body;
            const file = req.file;
            const userId = req.user.id;

            if (!file) {
                return res.status(404).json({ message: 'Không thấy tài liệu' });
            }

            const user = await User.findById(userId);
            const classData = await Class.findById(ClassId);

            if (!user || user.Role !== 'teacher' || !classData || classData.Teacher.toString() !== userId) {
                return res.status(403).json({ message: 'Chỉ giáo viên của lớp này mới có thể tạo tài liệu' });
            }

            const createDocument = new Document({ Tittle, Description, Class: ClassId, File: req.file.buffer });
            const newDocument = await createDocument.save();
            return res.status(200).json({ message: 'Tải tệp lên thành công' });
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

            if (!user || !classData || !classData.Student.includes(userId)) {
                return res.status(403).json({ message: 'Chỉ học sinh của lớp này mới có thể lấy tài liệu' });
            }

            const documents = await Document.find({ Class: classId });
            if (!documents || documents.length === 0) {
                return res.status(404).json({ message: 'Không tìm thấy tài liệu cho lớp này' });
            }
            res.status(200).json({ documents });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi lấy tài liệu', error });
        }
    },

    // API để tải xuống tài liệu
    downloadDocument: async (req, res) => {
        try {
            const documentId = req.params.documentId;
            const userId = req.user.id;  // Lấy thông tin người dùng từ `req.user.id`

            const document = await Document.findById(documentId);
            const classData = await Class.findById(document.Class);

            if (!document) {
                return res.status(404).json({ message: 'Tài liệu không tồn tại' });
            }

            const user = await User.findById(userId);
            if (!user || !classData || !classData.Student.includes(userId)) {
                return res.status(403).json({ message: 'Chỉ học sinh của lớp này mới có thể tải tài liệu' });
            }

            res.setHeader('Content-Disposition', 'attachment; filename=' + document.Tittle);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(document.File);
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

            if (!document) {
                return res.status(404).json({ message: 'Tài liệu không tồn tại' });
            }

            const user = await User.findById(userId);
            if (!user || classData.Teacher.toString() !== userId) {
                return res.status(403).json({ message: 'Chỉ giáo viên của lớp này mới có thể sửa tài liệu' });
            }

            document.Tittle = Tittle || document.Tittle;
            document.Description = Description || document.Description;

            await document.save();
            return res.status(200).json({ message: 'Cập nhật tài liệu thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi khi sửa tài liệu', error });
        }
    }
}

module.exports = documentController;