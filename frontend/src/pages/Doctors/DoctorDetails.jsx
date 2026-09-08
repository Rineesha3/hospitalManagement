import React, { useState } from "react";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "./DoctorAbout.jsx";
import Feedback from "./Feedback.jsx";
import SidePanel from "./SidePanel.jsx";
import { BASE_URL } from "./../../config";
import useFetchData from "../../hooks/useFetchData";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { useParams } from "react-router-dom";
import Avatar from "../../components/Avatar/Avatar";
const DoctorDetails = () => {
  const [tab, setTab] = useState("about");
  const { id } = useParams();
  const {
    data: doctor,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/doctors/${id}`);
  const {
    name,
    qualifications,
    experiences,
    timeSlots,
    reviews,
    bio,
    about,
    averageRating,
    totalRating,
    specialization,
    ticketPrice,
    photo,
  } = doctor;
  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && <Loader />}
        {error && <Error />}
        {!loading && !error && (
          <div className="grid md:grid-cols-3 gap-8 md:gap-[50px]">
            <div className="md:col-span-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <figure className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] shrink-0">
                  <Avatar src={photo} className="w-full h-full rounded" />
                </figure>
                <div>
                  <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-6 lg:py-2 lg:px-6 text-[12px] leading-4 lg:text-[16px] lg:leading-7 font-semibold rounded">
                    {specialization}
                  </span>
                  <h3 className="text-headingColor text-[22px] leading-9 mt-3 font-bold">
                    {name}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-[6px]">
                    <span className="flex items-center gap-[6px] text-[14px] leading-5 lg:text-[16px] lg:leading-7 font-semibold text-headingColor">
                      <img src={starIcon} alt="" /> {Number(averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-[14px] leading-5 lg:text-[16px] lg:leading-7 font-[400] text-textColor">
                      ({totalRating})
                    </span>
                  </div>
                  <p className="text__para text-[14px] leading-6 md:text-[15px] lg:max-w-[390px]">
                    {bio}
                  </p>
                </div>
              </div>

              <div className="mt-[50px] border-b border-solid border-[#0066ff34]">
                <button
                  onClick={() => setTab("about")}
                  className={`py-2 px-3 sm:px-5 mr-3 sm:mr-5 text-[15px] sm:text-[16px] leading-7 text-headingColor font-semibold ${
                    tab === "about"
                      ? "border-b border-solid border-primaryColor"
                      : ""
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setTab("feedback")}
                  className={`py-2 px-3 sm:px-5 mr-3 sm:mr-5 text-[15px] sm:text-[16px] leading-7 text-headingColor font-semibold ${
                    tab === "feedback"
                      ? "border-b border-solid border-primaryColor"
                      : ""
                  }`}
                >
                  Feedback
                </button>
              </div>
              <div className="mt-[50px]">
                {tab === "about" && (
                  <DoctorAbout
                    name={name}
                    about={about}
                    experiences={experiences}
                    qualifications={qualifications}
                  />
                )}
                {tab === "feedback" && (
                  <Feedback
                    doctorId={doctor._id}
                    reviews={reviews}
                    averageRating={averageRating}
                    totalRating={totalRating}
                  />
                )}
              </div>
            </div>
            <div>
              <SidePanel
                doctorId={doctor._id}
                ticketPrice={ticketPrice}
                timeSlots={timeSlots}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default DoctorDetails;
