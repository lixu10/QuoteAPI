import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import config from '../config/index.js';

export class AuthService {
  constructor() {
    this.userModel = new User();
  }

  async register(username, password) {
    const existingUser = this.userModel.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = this.userModel.createUser(username, hashedPassword);

    return { id: userId, username };
  }

  async login(username, password) {
    const user = this.userModel.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('用户名或密码错误');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.is_admin },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.is_admin
      }
    };
  }

  getAllUsers() {
    return this.userModel.getAllUsers();
  }

  deleteUser(id) {
    return this.userModel.deleteUser(id);
  }
}
