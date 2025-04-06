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
        // Lấy ngày hiện tại
        const currentDate = new Date();

        // Tính toán 28 ngày trước
        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - 28);  // Trừ 28 ngày

        // Truy vấn và thống kê số lượng blog được đăng trong 28 ngày gần nhất
        const result = await Blog.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,  // Lọc theo ngày tạo từ 28 ngày trước
                        $lte: currentDate  // Đến ngày hiện tại
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
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }  // Sắp xếp theo ngày
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

        res.status(200).json(result);
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
        // Lấy ngày hiện tại
        const currentDate = new Date();

        // Tính toán 28 ngày trước
        const startDate = new Date();
        startDate.setDate(currentDate.getDate() - 28);  // Trừ 28 ngày

        // Truy vấn và thống kê số lượng tin nhắn được gửi trong 28 ngày gần nhất
        const result = await Messenger.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: startDate,  // Lọc theo ngày tạo từ 28 ngày trước
                        $lte: currentDate  // Đến ngày hiện tại
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
                    count: { $sum: 1 }  // Đếm số tin nhắn gửi mỗi ngày
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }  // Sắp xếp theo ngày
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

        res.status(200).json(result);
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
