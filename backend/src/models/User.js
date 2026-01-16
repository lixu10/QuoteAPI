import { BaseModel } from './BaseModel.js';

export class User extends BaseModel {
  constructor() {
    super('users');
  }

  findByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  getAllUsers() {
    const stmt = this.db.prepare('SELECT id, username, is_admin, created_at FROM users');
    return stmt.all();
  }

  createUser(username, hashedPassword, isAdmin = 0) {
    return this.create({
      username,
      password: hashedPassword,
      is_admin: isAdmin
    });
  }

  deleteUser(id) {
    if (id === 1) {
      throw new Error('Cannot delete default admin user');
    }
    return this.delete(id);
  }
}
