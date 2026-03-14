/** 
 * Utility functions for generating and verifying JSON Web Tokens (JWTs) for user authentication.
*/

import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "1d" }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch {
        return null;
    }
};