import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authContext } from "../../context/authContext";
import { BASE_URL } from "../../config";

function nextDays(count) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push({
      dateStr: d.toISOString().split("T")[0],
      weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: d.getDate(),
    });
  }
  return days;
}

const SidePanel = ({ doctorId, ticketPrice, timeSlots }) => {
  const days = nextDays(14);
  const [selectedDate, setSelectedDate] = useState(days[0].dateStr);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultationType, setConsultationType] = useState("clinic");
  const [booking, setBooking] = useState(false);
  const { token, role } = useContext(authContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!doctorId || !selectedDate) return;
    setSelectedSlot(null);
    setSlotsLoading(true);
    fetch(`${BASE_URL}/bookings/available-slots?doctorId=${doctorId}&date=${selectedDate}`)
      .then((res) => res.json())
      .then((result) => setSlots(result.data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [doctorId, selectedDate]);

  const bookingHandler = async () => {
    if (!token || role !== "patient") {
      toast.error("Please login as a patient to book an appointment");
      return navigate("/login");
    }
    if (!selectedSlot) {
      return toast.error("Please select a time slot");
    }
    setBooking(true);
    try {
      const res = await fetch(`${BASE_URL}/bookings`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId,
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          consultationType,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message);
      }
      toast.success(result.message);
      setSelectedSlot(null);
      setSlots((prev) => prev.filter((s) => s.startTime !== selectedSlot.startTime));
    } catch (err) {
      toast.error(err.message);
    }
    setBooking(false);
  };

  return (
    <div id="book" className="shadow-panelShadow p-3 lg:p-5 rounded-md">
      <div className="flex items-center justify-between">
        <p className="text__para mt-0 font-semibold">Consultation Fee</p>
        <span className="text-[16px] leading-7 lg:text-[22px] lg:leading-8 text-headingColor font-bold">
          {ticketPrice}
        </span>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">Select a Date</p>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => setSelectedDate(d.dateStr)}
              className={`shrink-0 w-[52px] py-2 rounded-md text-center border border-solid ${
                selectedDate === d.dateStr
                  ? "bg-primaryColor text-white border-primaryColor"
                  : "border-[#0066ff34] text-textColor"
              }`}
            >
              <div className="text-[11px]">{d.weekday}</div>
              <div className="text-[14px] font-semibold">{d.day}</div>
              <div className="text-[10px]">{d.month}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">Available Times</p>
        {slotsLoading && <p className="text-[14px] text-textColor mt-2">Loading...</p>}
        {!slotsLoading && slots.length === 0 && (
          <p className="text-[14px] text-textColor mt-2">No slots available this day</p>
        )}
        {!slotsLoading && slots.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
            {slots.map((slot) => (
              <button
                key={slot.startTime}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`py-2 rounded-md text-[13px] font-semibold border border-solid ${
                  selectedSlot?.startTime === slot.startTime
                    ? "bg-primaryColor text-white border-primaryColor"
                    : "border-[#0066ff34] text-textColor"
                }`}
              >
                {slot.startTime}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">Consultation</p>
        <div className="flex gap-5 mt-3">
          <label className="flex items-center gap-2 text-[14px] text-textColor cursor-pointer">
            <input
              type="radio"
              name="consultationType"
              checked={consultationType === "clinic"}
              onChange={() => setConsultationType("clinic")}
            />
            Clinic
          </label>
          <label className="flex items-center gap-2 text-[14px] text-textColor cursor-pointer">
            <input
              type="radio"
              name="consultationType"
              checked={consultationType === "video"}
              onChange={() => setConsultationType("video")}
            />
            Video
          </label>
        </div>
      </div>

      <div className="mt-[30px]">
        <p className="text__para mt-0 font-semibold text-headingColor">Weekly Availability</p>
        <ul className="mt-3">
          {timeSlots?.map((item, index) => (
            <li key={index} className="flex items-center justify-between mb-2">
              <p className="text-[14px] leading-6 text-textColor font-semibold capitalize">
                {item.day}
              </p>
              <p className="text-[14px] leading-6 text-textColor font-semibold">
                {item.startingTime} - {item.endingTime}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={bookingHandler}
        disabled={booking || !selectedSlot}
        className="btn px-2 w-full rounded-md mt-[30px] disabled:opacity-50"
      >
        {booking ? "Booking..." : "Confirm Appointment"}
      </button>
    </div>
  );
};

export default SidePanel;
