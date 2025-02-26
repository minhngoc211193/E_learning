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

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.Role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
        }
    });
};


module.exports = { verifyToken, verifyAdmin };