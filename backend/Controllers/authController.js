import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET_key, { expiresIn: "15d" });
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req, res) => {
  const { email, password, name, role, photo, gender } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, message: "Email, password and name are required" });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: "Please provide a valid email address" });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }
  if (role !== "patient" && role !== "doctor") {
    return res.status(400).json({ success: false, message: "Role must be either patient or doctor" });
  }
  try {
    let user = null;
    if (role === "patient") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === "patient") {
      user = new User({
        email,
        password: hashedPassword,
        name,
        photo,
        gender,
        role,
      });
    }
    if (role === "doctor") {
      user = new Doctor({
        email,
        password: hashedPassword,
        name,
        photo,
        gender,
        role,
      });
    }

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "User successfully created" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error, Try again" });
  }
};
export const login = async (req, res) => {
    const { email} = req.body;
  try {
    let user = null;
    const patient = await User.findOne({ email });
    const doctor = await Doctor.findOne({ email });
    if (patient) {
      user = patient;
    }
    if (doctor) {
      user = doctor;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isActive === false) {
      return res.status(403).json({ status: false, message: "This account has been suspended" });
    }
    if (doctor && doctor.isApproved === "rejected") {
      return res.status(403).json({ status: false, message: "Your doctor registration was rejected" });
    }
    if (doctor && doctor.isApproved === "suspended") {
      return res.status(403).json({ status: false, message: "Your doctor account has been suspended" });
    }

    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);
    const { password, role, appointments, ...rest } = user._doc;
    res
      .status(200)
      .json({
        status: true,
        message: "Login successful",
        token,
        data: { ...rest },
        role,
      });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to login",
    });
  }
};
