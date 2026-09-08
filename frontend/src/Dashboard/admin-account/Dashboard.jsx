import { useContext, useState } from "react";
import { authContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";
import StatsPanel from "./StatsPanel";
import DoctorsPanel from "./DoctorsPanel";
import UsersPanel from "./UsersPanel";
import BookingsPanel from "./BookingsPanel";

const tabs = [
  { key: "stats", label: "Overview" },
  { key: "doctors", label: "Doctors" },
  { key: "users", label: "Patients" },
  { key: "bookings", label: "Bookings" },
];

const AdminDashboard = () => {
  const [tab, setTab] = useState("stats");
  const { dispatch, user } = useContext(authContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  return (
    <section>
      <div className="max-w-[1170px] px-5 mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-headingColor font-bold text-[24px] leading-9">
              Admin Dashboard
            </h2>
            <p className="text-textColor text-[14px]">Signed in as {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-[#181A1E] px-4 py-2 text-[14px] rounded-md text-white"
          >
            Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mb-8 border-b border-solid border-[#0066ff34] pb-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md font-semibold text-[15px] ${
                tab === t.key
                  ? "bg-primaryColor text-white"
                  : "bg-transparent text-headingColor hover:bg-indigo-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "stats" && <StatsPanel />}
        {tab === "doctors" && <DoctorsPanel />}
        {tab === "users" && <UsersPanel />}
        {tab === "bookings" && <BookingsPanel />}
      </div>
    </section>
  );
};

export default AdminDashboard;
