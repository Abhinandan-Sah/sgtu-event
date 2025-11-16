import Admin from '../models/Admin.model.js';
import Student from '../models/Student.model.js';
import Volunteer from '../models/Volunteer.model.js';
import Stall from '../models/Stall.model.js';
import CheckInOut from '../models/CheckInOut.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { successResponse, errorResponse } from '../helpers/response.js';
import { setAuthCookie, clearAuthCookie } from '../helpers/cookie.js';
import { query } from '../config/db.js';

/**
 * Admin Controller
 * Handles admin authentication and management operations
 */

/**
 * Admin login
 * @route POST /api/admin/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const admin = await Admin.findByEmail(email, query);
    if (!admin) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set secure HTTP-Only cookie
    setAuthCookie(res, token);

    return successResponse(res, {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin profile
 * @route GET /api/admin/profile
 */
const getProfile = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user.id, query);
    if (!admin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      created_at: admin.created_at
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logout
 * @route POST /api/admin/logout
 */
const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile
 * @route PUT /api/admin/profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const updateData = {};

    if (email) {
      updateData.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(12);
      updateData.password_hash = await bcrypt.hash(password, salt);
    }

    const updatedAdmin = await Admin.update(req.user.id, updateData, query);
    if (!updatedAdmin) {
      return errorResponse(res, 'Admin not found', 404);
    }

    return successResponse(res, {
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      full_name: updatedAdmin.full_name
    }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students (admin view)
 * @route GET /api/admin/students
 */
const getAllStudents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const students = await Student.findAll(limit, offset, query);
    return successResponse(res, students);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all volunteers (admin view)
 * @route GET /api/admin/volunteers
 */
const getAllVolunteers = async (req, res, next) => {
  try {
    const volunteers = await Volunteer.findAllActive(query);
    return successResponse(res, volunteers);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all stalls (admin view)
 * @route GET /api/admin/stalls
 */
const getAllStalls = async (req, res, next) => {
  try {
    const stalls = await Stall.findAll(query);
    return successResponse(res, stalls);
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 * @route GET /api/admin/stats
 */
const getStats = async (req, res, next) => {
  try {
    const [students, volunteers, stalls] = await Promise.all([
      Student.findAll(100, 0, query),
      Volunteer.findAllActive(query),
      Stall.findAll(query)
    ]);

    return successResponse(res, {
      totalStudents: students.length,
      totalVolunteers: volunteers.length,
      totalStalls: stalls.length,
      activeCheckIns: 0 // TODO: Implement check-in counting
    });
  } catch (error) {
    next(error);
  }
};

export default {
  login,
  logout,
  getProfile,
  updateProfile,
  getAllStudents,
  getAllVolunteers,
  getAllStalls,
  getStats
};
