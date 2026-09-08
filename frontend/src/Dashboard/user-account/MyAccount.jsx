import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authContext } from "../../context/authContext";
import MyBookings from "./MyBookings";
import Profile from "./Profile";
import useGetProfile from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import Avatar from "../../components/Avatar/Avatar";
const MyAccount = () => {
  const { dispatch } = useContext(authContext);
  const navigate = useNavigate();
  const [tab, setTab] = useState("bookings");
  const {
    data: userData,
    loading,
    error,
  } = useGetProfile(`${BASE_URL}/users/profile/me`);
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };
  const handleDeleteAccount = async () => {
    if (!window.confirm("This will permanently delete your account. Continue?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users/${userData._id}`, {
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
        {loading && !error && <Loading/>}
        {error && !loading && <Error errMessage={error}/>}
        {!loading && !error && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pb-8 mb-8 border-b border-solid border-[#0066ff1c]">
              <figure className="w-[90px] h-[90px] rounded-full border-2 border-solid border-primaryColor shrink-0 mx-auto sm:mx-0">
                <Avatar src={userData.photo} className="w-full h-full rounded-full" />
              </figure>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-[18px] leading-[30px] text-headingColor font-bold">
                  {userData.name}
                </h3>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  {userData.email}
                </p>
                <p className="text-textColor text-[15px] leading-6 font-medium">
                  Blood Type:{" "}
                  <span className="ml-2 text-headingColor text-[18px] leading-7">
                    {userData.bloodType}
                  </span>
                </p>
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

            <div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setTab("bookings")}
                  className={`${
                    tab === "bookings" && "bg-primaryColor text-white font-normal"
                  } p-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  My Bookings
                </button>
                <button
                  onClick={() => setTab("settings")}
                  className={`${
                    tab === "settings" && "bg-primaryColor text-white font-normal"
                  } p-2 px-5 rounded-md text-headingColor font-semibold text-[16px] leading-7 border border-solid border-primaryColor`}
                >
                  Profile Settings
                </button>
              </div>
              <div className="mt-6">
                {tab === "bookings" && <MyBookings />}
                {tab === "settings" && <Profile user={userData}/>}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MyAccount;
