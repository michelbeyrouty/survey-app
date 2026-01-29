const { sql } = require('./db');
const AppError = require('../errors/AppError');

class UserService {

    async getUser(userId){
        try {
            const users = await sql(
                "SELECT id, name, role FROM users WHERE id = ?",
                [userId]
            );

            if (users.length === 0) {
                throw new AppError('User not found');
            }

            return users[0];
        } catch (e) {
            console.error(e);
            throw new AppError("Internal server error");
        }
    }

    async getAllUsers(){
        try {
            return await sql("SELECT id, name, role FROM users");
        } catch (e) {
            console.error(e);
            throw new AppError("Internal server error");
        }
    }
}

module.exports = UserService;
