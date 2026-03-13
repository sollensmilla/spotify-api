import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) return null;

    if (!authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];

    return verifyToken(token);
};