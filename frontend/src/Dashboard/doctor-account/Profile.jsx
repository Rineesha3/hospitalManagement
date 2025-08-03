import { useState, useEffect,useContext } from "react";
import { authContext } from '../../context/authContext.jsx';
import { AiOutlineDelete } from "react-icons/ai";
import uploadImageToCloudinary from "../../utils/uploadCloudinary";
import { BASE_URL, token } from "../../config.js";
import { toast } from "react-toastify";
const Profile = ({ doctorData }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
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
    timeSlots: [{ day: "", startTime: "", endTime: "" }],
    about: "",
    photo: "",
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { dispatch, role } = useContext(authContext);

  useEffect(() => {
    if (doctorData) {
      setFormData({
        name: doctorData?.name,
        email: doctorData?.email,
        phone: doctorData?.phone,
        bio: doctorData?.bio,
        gender: doctorData?.gender,
        specialization: doctorData?.specialization,
        ticketPrice: doctorData?.ticketPrice,
        qualifications: doctorData?.qualifications,
        experiences: doctorData?.experiences,
        timeSlots: doctorData?.timeSlots
      });
    }
  }, [doctorData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const data = await uploadImageToCloudinary(file);
    setFormData({ ...formData, photo: data?.url });
  };

  const updateProfileHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/doctors/${doctorData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) {
        dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          user: result.data, 
          token,
          role,
        },
      });
        throw Error(result.message);
      }
      toast.success(result.message);
    } catch (err) {
      toast.error(err.message);
    }
    toast.success(result.message);
    setTimeout(() => {
      window.location.reload();
    }, 1000);

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
        <div className="mb-5 grid grid-cols-3 gap-5">
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
        <div className="mb-5 grid grid-cols-3 gap-5">
          <div>
            <p className="form__label">Specialization*</p>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              className="form__input py-3.5"
            >
              <option value="">Select</option>
              <option value="surgeon">Surgeon</option>
              <option value="neurologist">Neurologist</option>
              <option value="dermatologist">Dermatologist</option>
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
            <div key={index} className="grid grid-cols-2 gap-5 mb-4">
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
              <div className="col-span-2 flex justify-end">
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
            <div key={index} className="grid grid-cols-2 gap-5 mb-4">
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
              <div className="col-span-2 flex justify-end">
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
          <div className="flex justify-between items-center">
            <p className="form__label">Time Slots*</p>
            <button
              type="button"
              onClick={() =>
                setFormData({
                  ...formData,
                  timeSlots: [
                    ...formData.timeSlots,
                    { day: "", startTime: "", endTime: "" },
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
              className="grid grid-cols-3 gap-5 mb-4 items-center"
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
                name="startTime"
                value={slot.startTime}
                onChange={(e) => handleTimeSlotChange(e, index)}
                className="form__input"
              />
              <input
                type="time"
                name="endTime"
                value={slot.endTime}
                onChange={(e) => handleTimeSlotChange(e, index)}
                className="form__input"
              />
              <div className="col-span-3 flex justify-end">
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
            <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
              <img
                src={formData.photo}
                alt="Profile"
                className="w-full rounded-full"
              />
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
