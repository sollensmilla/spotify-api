/** 
 * Service class for handling user-related database operations.
*/

import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt.js";

export class UserService {

    constructor(pool) {
        this.pool = pool;
    }

    async register(email, password) {

        const hashed = await bcrypt.hash(password, 10);

        const res = await this.pool.query(
            `INSERT INTO users(email, password)
       VALUES ($1,$2)
       RETURNING id,email`,
            [email, hashed]
        );

        const user = res.rows[0];

        return {
            token: generateToken(user)
        };
    }

    async login(email, password) {

        const res = await this.pool.query(
            `SELECT * FROM users WHERE email=$1`,
            [email]
        );

        const user = res.rows[0];

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            throw new Error("Invalid credentials");
        }

        return {
            token: generateToken(user)
        };
    }

}