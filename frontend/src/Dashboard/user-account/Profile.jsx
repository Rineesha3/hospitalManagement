import { useContext, useEffect, useState } from "react";
import {useNavigate } from "react-router-dom";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config";
import { toast } from "react-toastify";
import HashLoader from 'react-spinners/HashLoader';
import { FiEye, FiEyeOff } from "react-icons/fi";
import Avatar from "../../components/Avatar/Avatar";
import { authContext } from "../../context/authContext";
const Profile = ({user}) => {
  const { dispatch } = useContext(authContext);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    photo: null,
    gender: "",
    bloodType: "",
  });
  const navigate = useNavigate();
  useEffect(()=>{
    setFormData((prev) => ({
      ...prev,
      name: user.name,
      email: user.email,
      photo: user.photo,
      gender: user.gender,
      bloodType: user.bloodType,
    }))
  },[user])
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }
    if (formData.newPassword || formData.currentPassword || formData.confirmNewPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = "Enter your current password";
      }
      if (!formData.newPassword) {
        newErrors.newPassword = "Enter a new password";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }
      if (formData.confirmNewPassword !== formData.newPassword) {
        newErrors.confirmNewPassword = "Passwords do not match";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setSelectedFile(data.url);
    setFormData({ ...formData, photo: data.url });
  };
  const submitHandler = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { confirmNewPassword: _confirmNewPassword, ...payload } = formData;
      if (!payload.newPassword) {
        delete payload.currentPassword;
        delete payload.newPassword;
      }
      const res = await fetch(`${BASE_URL}/users/${user._id}`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      const { message, data } = await res.json();
      if (!res.ok) {
        throw new Error(message);
      }
      setLoading(false);
      toast.success(message);
      dispatch({ type: "UPDATE_USER", payload: data });
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmNewPassword: "" }));
      navigate("/users/profile/me");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };
  return (
    <div className="mt-10">
      <form onSubmit={submitHandler}>
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
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
          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-2 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              aria-readonly
              readOnly
            />
          </div>
        </div>

        <p className="text-headingColor font-bold text-[15px] mb-3">Change Password</p>
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Current Password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`w-full pl-2 pr-10 py-3 border-b border-solid ${errors.currentPassword ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
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
            {errors.currentPassword && <p className="text-red-500 text-[13px] mt-1">{errors.currentPassword}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Blood Type"
              name="bloodType"
              value={formData.bloodType}
              onChange={handleInputChange}
              className="w-full px-2 py-3 border-b border-solid border-[#0066ff61] focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer"
              required
            />
          </div>
        </div>
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full pl-2 pr-10 py-3 border-b border-solid ${errors.newPassword ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
              />
            </div>
            {errors.newPassword && <p className="text-red-500 text-[13px] mt-1">{errors.newPassword}</p>}
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter New Password"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                className={`w-full pl-2 pr-10 py-3 border-b border-solid ${errors.confirmNewPassword ? "border-red-500" : "border-[#0066ff61]"} focus:outline-none focus:border-b-primaryColor text-[16px] leading-7 text-headingColor placeholder:text-textColor cursor-pointer`}
              />
            </div>
            {errors.confirmNewPassword && <p className="text-red-500 text-[13px] mt-1">{errors.confirmNewPassword}</p>}
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">

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
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
              <Avatar src={formData.photo} className="w-full h-full rounded-full" />
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
              {selectedFile ? "Photo Uploaded" : "Upload Photo"}
            </label>
          </div>
        </div>

        <div className="mt-7">
          <button
            disabled={loading && true}
            type="submit"
            className="w-full bg-primaryColor text-white text-[18px] leading-[30px] rounded-lg px-4 py-3"
          >
            {loading ? <HashLoader size={25} color="#ffffff" /> : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
