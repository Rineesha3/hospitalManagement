import React, { useState } from "react";
import signupImg from "../assets/images/signup.gif";
import { Link, useNavigate } from "react-router-dom";
import uploadImageToCloudinary from "../utils/uploadCloudinary";
import { BASE_URL } from "../config.js";
import { toast } from "react-toastify";
import HashLoader from "react-spinners/HashLoader";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Avatar from "../components/Avatar/Avatar";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    photo: selectedFile,
    gender: "",
    role: "patient",
  });
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = "Please provide a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setPreviewURL(data.url);
    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });
  };
  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const { message } = await res.json();
      if (!res.ok) {
        throw new Error(message);
      }
      setLoading(false);
      toast.success(message);
      navigate("/login");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };
  return (
    <section className="px-5 xl:px-0">
      <div className="max-w-[1170px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/*img box */}
          <div className="bg-primaryColor rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
            <figure className="rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none">
              <img src={signupImg} alt="" className="w-full rounded-t-lg lg:rounded-l-lg lg:rounded-tr-none" />
            </figure>
          </div>
          {/*sign up form */}
          <div className="rounded-l-lg lg:pl-16 py-10">
            <h3 className="text-headingColor text-[22px] leading-9 font-bold mb-10">
              Create an <span className="text-primaryColor">account</span>
            </h3>
            <form onSubmit={submitHandler}>
              <div className="mb-5">
                <input
                  type="text"
                  placeholder="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 border-b border-solid ${errors.name ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
                />
                {errors.name && <p className="text-red-500 text-[13px] mt-1">{errors.name}</p>}
              </div>
              <div className="mb-5">
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-2 py-3 border-b border-solid ${errors.email ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
                />
                {errors.email && <p className="text-red-500 text-[13px] mt-1">{errors.email}</p>}
              </div>
              <div className="mb-5">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-2 pr-10 py-3 border-b border-solid ${errors.password ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-textColor"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEye className="w-5 h-5" /> : <FiEyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-[13px] mt-1">{errors.password}</p>}
              </div>

              <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Are you a:
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                  </select>
                </label>
                <label className="text-headingColor font-bold text-[16px] leading-7">
                  Gender:
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="text-textColor font-semibold text-[15px] leading-7 px-4 py-3 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
              </div>

              <div className="mb-5 flex items-center gap-3">
                {previewURL && (
                  <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
                    <Avatar src={previewURL} className="w-full h-full rounded-full" />
                  </figure>
                )}

                <div className="relative w-[130px] h-[50px]">
                  <input
                    type="file"
                    name="photo"
                    id="customFile"
                    onChange={handleFileChange}
                    accept=".jpg,.png"
                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <label
                    htmlFor="customFile"
                    className="absolute top-0 left-0 w-full h-full flex items-center px-[0.75rem] py-[0.375rem] text-[15px] leading-6 overflow-hidden bg-blue-100 text-headingColor font-semibold rounded-lg truncate cursor-pointer"
                  >
                    Upload Photo
                  </label>
                </div>
              </div>

              <div className="mt-7">
                <button
                  disabled={loading && true}
                  type="submit"
                  className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
                >
                  {loading ? (
                    <HashLoader size={35} color="#ffffff" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </div>
              <p className="mt-5 text-textColor text-center">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primaryColor font-medium ml-1"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
