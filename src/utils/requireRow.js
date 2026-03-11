export const requireRow = (res, message = "Resource not found") => {
    if (!res.rows[0]) {
        throw new Error(message);
    }
    return res.rows[0];
};