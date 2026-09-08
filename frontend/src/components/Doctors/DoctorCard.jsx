import React, { useContext } from "react";
import starIcon from "../../assets/images/Star.png";
import { Link } from "react-router-dom";
import { authContext } from "../../context/authContext";
import Avatar from "../Avatar/Avatar";

function getYearsExperience(experiences) {
  const years = (experiences || [])
    .map((e) => parseInt(e.startingDate))
    .filter((y) => !isNaN(y));
  if (years.length === 0) return null;
  const diff = new Date().getFullYear() - Math.min(...years);
  return diff > 0 ? diff : null;
}

function formatNextAvailable(slot) {
  if (!slot) return null;
  const today = new Date().toISOString().split("T")[0];
  const label =
    slot.date === today
      ? "Today"
      : new Date(`${slot.date}T00:00:00.000Z`).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
  return `${label} • ${slot.startTime}`;
}

const DoctorCard = ({ doctor }) => {
  const {
    name,
    averageRating,
    totalRating,
    photo,
    specialization,
    experiences,
    ticketPrice,
    nextAvailableSlot,
  } = doctor;
  const { token, role } = useContext(authContext);
  const yearsExperience = getYearsExperience(experiences);
  const nextAvailable = formatNextAvailable(nextAvailableSlot);
  const profileLink = token ? `/doctors/${doctor._id}` : "/login";
  const canBook = !token || role === "patient";
  const bookLink = token ? `/doctors/${doctor._id}#book` : "/login";

  return (
    <div className="p-3 lg:p-5 shadow-panelShadow rounded-md">
      <div>
        <Avatar src={photo} className="w-full aspect-square rounded-md" />
      </div>
      <h2 className="text-[18px] leading-[30px] lg:text-[26px] lg:leading-9 text-headingColor font-[700] mt-3 lg:mt-5">
        {name}
      </h2>
      <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-2 lg:py-2 lg:px-6 text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded inline-block mt-2">
        {specialization}
      </span>
      <div className="mt-3 flex items-center gap-[6px]">
        <img src={starIcon} alt="" className="w-4 h-4" />
        <span className="text-[14px] lg:text-[16px] font-semibold text-headingColor">
          {Number(averageRating || 0).toFixed(1)}
        </span>
        <span className="text-[14px] text-textColor">({totalRating} reviews)</span>
      </div>
      {yearsExperience && (
        <p className="text-[14px] text-textColor mt-1">{yearsExperience} years experience</p>
      )}
      <p className="text-[14px] text-textColor mt-1">{ticketPrice} consultation fee</p>
      {nextAvailable && (
        <div className="mt-3 bg-green-50 rounded-md px-3 py-2">
          <p className="text-[12px] text-green-700 font-semibold">Next available</p>
          <p className="text-[14px] text-green-800">{nextAvailable}</p>
        </div>
      )}
      <div className="mt-4 flex gap-3">
        <Link
          to={profileLink}
          className="flex-1 text-center border border-solid border-primaryColor text-primaryColor py-2 rounded-md text-[14px] font-semibold hover:bg-primaryColor hover:text-white transition-colors"
        >
          View Profile
        </Link>
        {canBook && (
          <Link
            to={bookLink}
            className="flex-1 text-center border border-solid border-primaryColor bg-primaryColor text-white py-2 rounded-md text-[14px] font-semibold hover:bg-transparent hover:text-primaryColor transition-colors"
          >
            Book Now
          </Link>
        )}
      </div>
    </div>
  );
};

export default DoctorCard;
