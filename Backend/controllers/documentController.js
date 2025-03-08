const Document = require('../models/Document');

const documentController = {
    createDocument: async (req, res) => {
        try {
            const { Tittle, Description, ClassId } = req.body;
            const file = req.file;

            if (!req.file) {
                return res.status(404).json({ message: 'Không thấy tài liệu' });
            }
            const createDocument = new Document({ Tittle, Description, Class: ClassId, File: req.file.buffer });
            const newDocument = await createDocument.save();
            return res.status(200).json({ message: 'Tải tệp lên thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error uploading file', error });
        }
    },


}

module.exports = documentController;