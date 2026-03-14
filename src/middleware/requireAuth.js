/** 
 * Middleware function for requiring authentication in GraphQL resolvers.
*/

export function requireAuth(user) {

    if (!user) {
        const error = new Error("Unauthorized");
        error.status = 401;
        throw error;
    }

}