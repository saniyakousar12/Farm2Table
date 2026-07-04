const AuthService = require('./auth.service');
const { AppError } = require('../../middleware/error.middleware');

class AuthController {
  // Register
  async register(req, res, next) {
    try {
      const userData = req.body;
      const result = await AuthService.register(userData);
      
      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        throw new AppError('Please provide email and password', 400);
      }
      
      const result = await AuthService.login(email, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Logged in successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Refresh Token
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }
      
      const result = await AuthService.refreshToken(refreshToken);
      
      res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Logout
  async logout(req, res, next) {
    try {
      const userId = req.user.id;
      await AuthService.logout(userId);
      
      res.status(200).json({
        status: 'success',
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }
  
  // Get current user
  async getMe(req, res, next) {
    try {
      res.status(200).json({
        status: 'success',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();