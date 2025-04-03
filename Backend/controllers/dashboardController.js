const User = require("../models/User");
const Major = require("../models/Major");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

const getStudentCountByMajor = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.Role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { days = 7 } = req.query; 
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days)); 
        const result = await User.aggregate([
            { $match: { Role: "student", Major: { $ne: null }, createdAt: { $gte: dateLimit } } },
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

        const { days = 7 } = req.query; // Tham số ngày (7 hoặc 28 ngày)
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days)); // Xác định ngày bắt đầu

        const result = await User.aggregate([
            { $match: { Role: "teacher", Major: { $ne: null }, createdAt: { $gte: dateLimit } } },
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

        const { days = 7 } = req.query; // Tham số ngày (7 hoặc 28 ngày)
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days)); // Xác định ngày bắt đầu

        const result = await Class.aggregate([
            { $match: { Subject: { $ne: null }, createdAt: { $gte: dateLimit } } },
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

        const { days = 7 } = req.query; // Tham số ngày (7 hoặc 28 ngày)
        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - parseInt(days)); // Xác định ngày bắt đầu

        const result = await Subject.aggregate([
            { $match: { Major: { $ne: null }, createdAt: { $gte: dateLimit } } },
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

module.exports = {
    getStudentCountByMajor,
    getTeacherCountByMajor,
    getClassCountBySubject,
    getSubjectCountByMajor
};
