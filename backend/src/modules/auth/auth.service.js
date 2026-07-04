const jwt = require('jsonwebtoken');
const User = require('../user/user.model');
const { AppError } = require('../../middleware/error.middleware');

class AuthService {
  // Generate JWT Token
  static generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
  }

  // Generate Refresh Token
  static generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
  }

  // Register new user
  static async register(userData) {
    const { email, phone } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already registered', 400);
      }
      throw new AppError('Phone number already registered', 400);
    }
    
    // Create user
    const user = await User.create(userData);
    
    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    // Remove password from output
    user.password = undefined;
    user.refreshToken = undefined;
    
    return {
      user,
      token,
      refreshToken
    };
  }
  
  // Login user
  static async login(email, password) {
    // Get user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 401);
    }
    
    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate tokens
    const token = this.generateToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);
    
    // Update refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    // Remove password from output
    user.password = undefined;
    user.refreshToken = undefined;
    
    return {
      user,
      token,
      refreshToken
    };
  }
  
  // Refresh token
  static async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token required', 401);
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
    
    // Find user with this refresh token
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    });
    
    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }
    
    // Generate new tokens
    const newToken = this.generateToken(user._id);
    const newRefreshToken = this.generateRefreshToken(user._id);
    
    // Update refresh token
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    
    return {
      token: newToken,
      refreshToken: newRefreshToken
    };
  }
  
  // Logout
  static async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      $unset: { refreshToken: 1 }
    });
    
    return { message: 'Logged out successfully' };
  }
}

module.exports = AuthService;