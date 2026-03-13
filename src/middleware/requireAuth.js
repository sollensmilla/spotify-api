export function requireAuth(user) {

    if (!user) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

}