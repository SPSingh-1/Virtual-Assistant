import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies.token; // fix here
        if (!token) {
            return res.status(401).json({ message: "Token not found" });
        }

        // verify token
        const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

        // store user id in request
        req.userId = verifyToken.userId || verifyToken.id; // depending on what you stored

        next();
    } catch (error) {
        console.log("isAuth error:", error);
        return res.status(401).json({ message: "Token is not valid" });
    }
};

export default isAuth;
