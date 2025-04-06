const User = require("../models/User");
const Major = require("../models/Major");
const Class = require("../models/Class");
const Subject = require("../models/Subject");
const Blog = require("../models/Blog");
const Messenger = require("../models/Messenger");

const getStudentCountByMajor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.Role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await User.aggregate([
            { $match: { Role: "student", Major: { $ne: null } } },
            {
                $group: {
                    _id: "$Major",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "majors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "majorInfo"
                }
            },
            { $unwind: "$majorInfo" },
            {
                $project: {
                    _id: 0,
                    major: "$majorInfo.Name",
                    count: 1
                }
            }
        ]);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getTeacherCountByMajor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.Role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await User.aggregate([
            { $match: { Role: "teacher", Major: { $ne: null } } },
            {
                $group: {
                    _id: "$Major",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "majors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "majorInfo"
                }
            },
            { $unwind: "$majorInfo" },
            {
                $project: {
                    _id: 0,
                    major: "$majorInfo.Name",
                    count: 1
                }
            }
        ]);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getClassCountBySubject = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.Role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await Class.aggregate([
            { $match: { Subject: { $ne: null } } },
            {
                $group: {
                    _id: "$Subject",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "_id",
                    foreignField: "_id",
                    as: "subjectInfo"
                }
            },
            { $unwind: "$subjectInfo" },
            {
                $project: {
                    _id: 0,
                    subject: "$subjectInfo.Name",
                    count: 1
                }
            }
        ]);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getSubjectCountByMajor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.Role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        const result = await Subject.aggregate([
            { $match: { Major: { $ne: null } } },
            {
                $group: {
                    _id: "$Major",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "majors",
                    localField: "_id",
                    foreignField: "_id",
                    as: "majorInfo"
                }
            },
            { $unwind: "$majorInfo" },
            {
                $project: {
                    _id: 0,
                    major: "$majorInfo.Name",
                    count: 1
                }
            }
        ]);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getBlogCountByDay = async (req, res) => {
    try {
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - 27);

        // Lấy dữ liệu từ MongoDB như cũ
        const result = await Blog.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: currentDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    },
                    count: 1
                }
            }
        ]);

        // Tạo danh sách tất cả các ngày trong 28 ngày
        const allDates = [];
        const tempDate = new Date(startDate);
        while (tempDate <= currentDate) {
            const isoDate = tempDate.toISOString().slice(0, 10); // format YYYY-MM-DD
            allDates.push(isoDate);
            tempDate.setDate(tempDate.getDate() + 1);
        }

        // Biến đổi result thành Map để tra nhanh
        const resultMap = new Map(result.map(item => [item.date, item.count]));

        // Gộp dữ liệu: nếu ngày không có blog thì count = 0
        const finalResult = allDates.map(date => ({
            date,
            count: resultMap.get(date) || 0
        }));

        res.status(200).json(finalResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getStudentClassStatus = async (req, res) => {
    try {
        // Truy vấn số lượng học sinh đã xếp lớp
        const studentsWithClass = await User.aggregate([
            { 
                $match: { 
                    Role: "student", 
                    Classes: { $ne: [] }  // Lọc các học sinh đã có lớp
                }
            },
            {
                $count: "studentsWithClass"  // Đếm số học sinh đã xếp lớp
            }
        ]);

        // Truy vấn số lượng học sinh chưa xếp lớp
        const studentsWithoutClass = await User.aggregate([
            { 
                $match: { 
                    Role: "student", 
                    Classes: { $size: 0 }  // Lọc các học sinh không có lớp
                }
            },
            {
                $count: "studentsWithoutClass"  // Đếm số học sinh chưa xếp lớp
            }
        ]);

        // Trả kết quả cho người dùng
        const result = {
            studentsWithClass: studentsWithClass.length > 0 ? studentsWithClass[0].studentsWithClass : 0,
            studentsWithoutClass: studentsWithoutClass.length > 0 ? studentsWithoutClass[0].studentsWithoutClass : 0
        };

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

const getMessageCountByDay = async (req, res) => {
    try {
        // Lấy ngày hiện tại và ngày bắt đầu
        const currentDate = new Date();
        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - 27);

        // Truy vấn MongoDB: thống kê số lượng tin nhắn theo ngày
        const result = await Messenger.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startDate,
                        $lte: currentDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$timestamp" },
                        month: { $month: "$timestamp" },
                        day: { $dayOfMonth: "$timestamp" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: "$_id.day"
                                }
                            }
                        }
                    },
                    count: 1
                }
            }
        ]);

        // Tạo danh sách tất cả các ngày trong 28 ngày gần nhất
        const allDates = [];
        const tempDate = new Date(startDate);
        while (tempDate <= currentDate) {
            const isoDate = tempDate.toISOString().slice(0, 10); // YYYY-MM-DD
            allDates.push(isoDate);
            tempDate.setDate(tempDate.getDate() + 1);
        }

        // Dùng Map để ánh xạ ngày -> số lượng tin nhắn
        const resultMap = new Map(result.map(item => [item.date, item.count]));

        // Gộp lại: nếu không có tin nhắn thì count = 0
        const finalResult = allDates.map(date => ({
            date,
            count: resultMap.get(date) || 0
        }));

        res.status(200).json(finalResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getStudentCountByMajor,
    getTeacherCountByMajor,
    getClassCountBySubject,
    getSubjectCountByMajor,
    getBlogCountByDay,
    getMessageCountByDay,
    getStudentClassStatus
};
