import { useState, useEffect, useContext } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEye, FiEyeOff } from "react-icons/fi";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL } from "../../config.js";
import { toast } from "react-toastify";
import Avatar from "../../components/Avatar/Avatar";
import { authContext } from "../../context/authContext";

const SPECIALIZATIONS = [
  "General Practitioner",
  "Neurologist",
  "Dermatologist",
  "Mental Health Counselor",
  "Pediatrician",
  "Nutritionist",
  "Chronic Care Specialist",
  "Cardiologist",
  "Surgeon",
];

const Profile = ({ doctorData }) => {
  const { dispatch } = useContext(authContext);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    phone: "",
    bio: "",
    gender: "",
    specialization: "",
    ticketPrice: 0,
    qualifications: [
      { startingDate: "", endingDate: "", degree: "", university: "" },
    ],
    experiences: [
      { startingDate: "", endingDate: "", position: "", university: "" },
    ],
    timeSlots: [{ day: "", startingTime: "", endingTime: "" }],
    about: "",
    photo: "",
  });

  useEffect(() => {
    if (doctorData) {
      setFormData((prev) => ({
        ...prev,
        name: doctorData?.name,
        email: doctorData?.email,
        phone: doctorData?.phone,
        bio: doctorData?.bio,
        gender: doctorData?.gender,
        specialization: doctorData?.specialization,
        ticketPrice: doctorData?.ticketPrice,
        about: doctorData?.about,
        photo: doctorData?.photo,
        qualifications: doctorData?.qualifications?.length
          ? doctorData.qualifications
          : [{ startingDate: "", endingDate: "", degree: "", university: "" }],
        experiences: doctorData?.experiences?.length
          ? doctorData.experiences
          : [{ startingDate: "", endingDate: "", position: "", university: "" }],
        timeSlots: doctorData?.timeSlots?.length
          ? doctorData.timeSlots
          : [{ day: "", startingTime: "", endingTime: "" }],
      }));
    }
  }, [doctorData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setFormData({ ...formData, photo: data?.url });
  };

  const validate = () => {
    const newErrors = {};
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

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const token = localStorage.getItem("token");
      const { confirmNewPassword: _confirmNewPassword, ...payload } = formData;
      if (!payload.newPassword) {
        delete payload.currentPassword;
        delete payload.newPassword;
      }
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) {
        throw Error(result.message);
      }
      toast.success(result.message);
      dispatch({ type: "UPDATE_USER", payload: result.data });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleQualificationChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...formData.qualifications];
    updated[index][name] = value;
    setFormData({ ...formData, qualifications: updated });
  };

  const handleRemoveQualification = (index) => {
    const updated = [...formData.qualifications];
    updated.splice(index, 1);
    setFormData({ ...formData, qualifications: updated });
  };

  const handleExperienceChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...formData.experiences];
    updated[index][name] = value;
    setFormData({ ...formData, experiences: updated });
  };

  const handleRemoveExperience = (index) => {
    const updated = [...formData.experiences];
    updated.splice(index, 1);
    setFormData({ ...formData, experiences: updated });
  };

  const handleTimeSlotChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...formData.timeSlots];
    updated[index][name] = value;
    setFormData({ ...formData, timeSlots: updated });
  };

  const handleRemoveTimeSlot = (index) => {
    const updated = [...formData.timeSlots];
    updated.splice(index, 1);
    setFormData({ ...formData, timeSlots: updated });
  };

  return (
    <div>
      <h2 className="text-headingColor font-bold text-[24px] leading-9 mb-10">
        Profile Info
      </h2>
      <form>
        {/* Name */}
        <div className="mb-5">
          <p className="form__label">Name*</p>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Full Name"
            className="form__input"
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <p className="form__label">Email*</p>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="form__input"
            readOnly
            disabled={true}
          />
        </div>

        {/* Change Password */}
        <p className="text-headingColor font-bold text-[16px] mb-3">Change Password</p>
        <div className="mb-5">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Current Password"
              className="form__input pr-10"
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
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="New Password"
              className="form__input"
            />
            {errors.newPassword && <p className="text-red-500 text-[13px] mt-1">{errors.newPassword}</p>}
          </div>
          <div>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmNewPassword"
              value={formData.confirmNewPassword}
              onChange={handleInputChange}
              placeholder="Re-enter New Password"
              className="form__input"
            />
            {errors.confirmNewPassword && <p className="text-red-500 text-[13px] mt-1">{errors.confirmNewPassword}</p>}
          </div>
        </div>

        {/* Phone */}
        <div className="mb-5">
          <p className="form__label">Phone*</p>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Phone Number"
            className="form__input"
          />
        </div>

        {/* Bio */}
        <div className="mb-5">
          <p className="form__label">Bio*</p>
          <input
            type="text"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Bio"
            className="form__input"
            maxLength={100}
          />
        </div>

        {/* Gender */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="form__label">Gender*</p>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="form__input py-3.5"
            >
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Specialization */}
        <div className="mb-5 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <p className="form__label">Specialization*</p>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="form__input py-3.5"
            >
              <option value="">Select</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ticket Price */}
        <div className="mb-5">
          <p className="form__label">Ticket Price*</p>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleInputChange}
            placeholder="100"
            className="form__input"
          />
        </div>

        {/* Qualifications */}
        <div className="mb-5">
          <p className="form__label">Qualifications*</p>
          {formData.qualifications.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              <input
                type="date"
                name="startingDate"
                value={item.startingDate}
                onChange={(e) => handleQualificationChange(e, index)}
                className="form__input"
              />
              <input
                type="date"
                name="endingDate"
                value={item.endingDate}
                onChange={(e) => handleQualificationChange(e, index)}
                className="form__input"
              />
              <input
                type="text"
                name="degree"
                value={item.degree}
                onChange={(e) => handleQualificationChange(e, index)}
                className="form__input"
                placeholder="Degree"
              />
              <input
                type="text"
                name="university"
                value={item.university}
                onChange={(e) => handleQualificationChange(e, index)}
                className="form__input"
                placeholder="University"
              />
              <div className="col-span-1 sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveQualification(index)}
                  className="bg-red-600 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px] cursor-pointer"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                qualifications: [
                  ...formData.qualifications,
                  {
                    startingDate: "",
                    endingDate: "",
                    degree: "",
                    university: "",
                  },
                ],
              })
            }
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Qualifications
          </button>
        </div>

        {/* Experience */}
        <div className="mb-5">
          <p className="form__label">Experience*</p>
          {formData.experiences.map((item, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
              <input
                type="date"
                name="startingDate"
                value={item.startingDate}
                onChange={(e) => handleExperienceChange(e, index)}
                className="form__input"
              />
              <input
                type="date"
                name="endingDate"
                value={item.endingDate}
                onChange={(e) => handleExperienceChange(e, index)}
                className="form__input"
              />
              <input
                type="text"
                name="position"
                value={item.position}
                onChange={(e) => handleExperienceChange(e, index)}
                className="form__input"
                placeholder="Position"
              />
              <input
                type="text"
                name="university"
                value={item.university}
                onChange={(e) => handleExperienceChange(e, index)}
                className="form__input"
                placeholder="University / Hospital"
              />
              <div className="col-span-1 sm:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className="bg-red-600 p-2 rounded-full text-white text-[18px] mt-2 mb-[30px] cursor-pointer"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({
                ...formData,
                experiences: [
                  ...formData.experiences,
                  {
                    startingDate: "",
                    endingDate: "",
                    position: "",
                    university: "",
                  },
                ],
              })
            }
            className="bg-[#000] py-2 px-5 rounded text-white h-fit cursor-pointer"
          >
            Add Experience
          </button>
        </div>

        {/* Time Slots */}
        <div className="mb-5">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <p className="form__label">Time Slots*</p>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  timeSlots: [
                    ...formData.timeSlots,
                    { day: "", startingTime: "", endingTime: "" },
                  ],
                })
              }
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              + Add
            </button>
          </div>
          {formData.timeSlots.map((slot, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4 items-center"
            >
              <select
                name="day"
                value={slot.day}
                onChange={(e) => handleTimeSlotChange(e, index)}
                className="form__input"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <input
                type="time"
                name="startingTime"
                value={slot.startingTime}
                onChange={(e) => handleTimeSlotChange(e, index)}
                className="form__input"
              />
              <input
                type="time"
                name="endingTime"
                value={slot.endingTime}
                onChange={(e) => handleTimeSlotChange(e, index)}
                className="form__input"
              />
              <div className="col-span-1 sm:col-span-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveTimeSlot(index)}
                  className="bg-red-600 p-2 rounded-full text-white text-[18px] mt-2 cursor-pointer"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="mb-5">
          <p className="form__label">About*</p>
          <textarea
            name="about"
            rows={5}
            value={formData.about}
            onChange={handleInputChange}
            className="form__input"
            placeholder="Write about you"
          ></textarea>
        </div>

        {/* Upload Photo */}
        <div className="mb-5 flex items-center gap-3">
          {formData.photo && (
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center overflow-hidden">
              <Avatar src={formData.photo} className="w-full h-full rounded-full" />
            </figure>
          )}
          <div className="relative w-[130px] h-[50px]">
            <input
              type="file"
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

        {/* Submit */}
        <div className="mt-7">
          <button
            type="submit"
            onClick={updateProfileHandler}
            className="bg-primaryColor text-white text-[18px] leading-[30px] w-full py-3 px-4 rounded-lg"
          >
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
