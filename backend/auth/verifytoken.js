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

    const patient = await User.findById(userId);
    const doctor = await Doctor.findById(userId);

    const user = doctor || patient;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "You're not authorized",
      });
    }

    next();
  };
};
