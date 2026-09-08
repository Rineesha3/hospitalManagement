import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import { authContext } from "../../context/authContext";
import starIcon from "../../assets/images/Star.png";
import DoctorAbout from "./../../pages/Doctors/DoctorAbout";
import Profile from "./Profile";
import Appointments from "./Appointments";
import DashboardSummary from "./DashboardSummary";
import Avatar from "../../components/Avatar/Avatar";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "appointments", label: "Appointments" },
  { key: "settings", label: "Profile Settings" },
];

const Dashboard = () => {
  const { data, loading, error } = useFetchData(
    `${BASE_URL}/doctors/profile/me`
  );
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState(
    () => localStorage.getItem("selectedTab") || "overview"
  );
  const handleTabChange = (newTab) => {
    setTab(newTab);
    localStorage.setItem("selectedTab", newTab);
  };
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm("This will permanently delete your account. Continue?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/doctors/${data._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success("Account deleted");
      dispatch({ type: "LOGOUT" });
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        {loading && !error && <Loader />}
        {error && !loading && <Error />}
        {!loading && !error && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-8 mb-8 border-b border-solid border-[#0066ff1c]">
              <figure className="w-[90px] h-[90px] rounded-full border-2 border-solid border-primaryColor shrink-0 mx-auto sm:mx-0">
                <Avatar src={data?.photo} className="w-full h-full rounded-full" />
              </figure>
              <div className="text-center sm:text-left flex-1">
                <span className="bg-[#CCF0F3] text-irisBlueColor py-1 px-4 rounded text-[12px] leading-4 font-semibold inline-block">
                  {data.specialization}
                </span>
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold mt-1">
                  {data.name}
                </h3>
                <div className="flex items-center justify-center sm:justify-start gap-[6px]">
                  <span className="flex items-center gap-[6px] text-headingColor text-[14px] font-semibold">
                    <img src={starIcon} alt="" />
                    {Number(data.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-textColor text-[14px] font-semibold">
                    ({data.totalRating})
                  </span>
                </div>
              </div>
              <div className="flex sm:flex-col gap-2 justify-center">
                <button
                  onClick={handleLogout}
                  className="bg-[#181A1E] px-4 py-2 text-[14px] rounded-md text-white"
                >
                  Logout
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-600 px-4 py-2 text-[14px] rounded-md text-white"
                >
                  Delete account
                </button>
              </div>
            </div>

            {data.isApproved === "pending" && (
              <div className="flex p-4 mb-6 text-yellow-800 bg-yellow-50 rounded-lg">
                <svg
                  aria-hidden="true"
                  className="flex-shrink-0 w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Info</span>
                <div className="ml-3 text-sm font-medium">
                  To get approval please complete your profile. We'll review
                  manually and approve within 3 days.
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => handleTabChange(t.key)}
                  className={`${
                    tab === t.key && "bg-primaryColor text-white font-normal"
                  } p-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {tab === "overview" && (
                <div>
                  <DashboardSummary />
                  <DoctorAbout
                    name={data.name}
                    about={data.about}
                    qualifications={data.qualifications}
                    experiences={data.experiences}
                  />
                </div>
              )}
              {tab === "appointments" && <Appointments appointments={data.appointments} />}
              {tab === "settings" && <Profile doctorData={data} />}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
