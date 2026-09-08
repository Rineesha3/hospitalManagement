import jwt from 'jsonwebtoken';
import Doctor from '../models/DoctorSchema.js';
import User from '../models/UserSchema.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token, authorization denied',
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_key);
    req.userId = decoded.id;
    req.role = decoded.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired, please login again' });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};
 
export const restrict = (roles) => {
  return async (req, res, next) => {
    const userId = req.userId;

    // Trust the role embedded in the token to avoid querying both collections,
    // but re-verify current account status on every request so a suspension/
    // rejection revokes access immediately even for an already-issued token.
    const isDoctorRole = req.role === "doctor";
    const user = isDoctorRole ? await Doctor.findById(userId) : await User.findById(userId);

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "You're not authorized",
      });
    }

    if (isDoctorRole && ["rejected", "suspended"].includes(user.isApproved)) {
      return res.status(403).json({
        success: false,
        message: "Your doctor account is not active",
      });
    }

    if (!isDoctorRole && user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been suspended",
      });
    }

    next();
  };
};
