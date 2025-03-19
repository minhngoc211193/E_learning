const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Bạn không có quyền truy cập" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Bạn không có quyền truy cập" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ" });
        }
        req.user = decoded;
        next(); // Quan trọng! Phải gọi next() khi xác thực thành công
    });
};

const verifyAdmin = (req, res, next) => { // Nhận userrole từ req :)) 
    verifyToken(req, res, () => {
        if (req.user && req.user.Role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
    });
};

// Middleware kiểm tra quyền truy cập dựa trên vai trò
const verifyRole = (allowedRoles) => {
    return (req, res, next) => {
        const { Role } = req.user; // Lấy vai trò từ user (được xác thực từ verifyToken)
        
        // Kiểm tra xem nếu không có allowedRoles thì trả về lỗi
        if (!allowedRoles || allowedRoles.length === 0) {
            return res.status(500).json({ message: "Không có role" });
        }

        // Kiểm tra nếu vai trò của người dùng nằm trong mảng allowedRoles
        if (allowedRoles.includes(Role)) {
            return next(); // Cho phép truy cập nếu vai trò hợp lệ
        } else {
            return res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
    };
};


module.exports = { verifyToken, verifyAdmin, verifyRole };