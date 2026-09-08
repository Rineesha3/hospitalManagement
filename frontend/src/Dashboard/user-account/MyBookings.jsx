import { useState } from "react";
import { toast } from "react-toastify";
import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { formatDate } from "../../utils/formatDate";
import NextAppointmentCard from "../../components/Bookings/NextAppointmentCard";
import Avatar from "../../components/Avatar/Avatar";
import { getVideoCallLink } from "../../utils/videoCall";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  "no-show": "bg-gray-200 text-gray-700",
};

const UPCOMING_STATUSES = ["pending", "confirmed"];
const HISTORY_STATUSES = ["completed", "no-show"];
const CANCELLED_STATUSES = ["cancelled", "rejected"];

const SECTIONS = [
  { key: "upcoming", label: "Upcoming" },
  { key: "history", label: "History" },
  { key: "cancelled", label: "Cancelled" },
];

const RescheduleWidget = ({ booking, onDone }) => {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadSlots = async (newDate) => {
    setDate(newDate);
    setSelectedSlot(null);
    if (!newDate) return setSlots([]);
    setLoadingSlots(true);
    try {
      const res = await fetch(
        `${BASE_URL}/bookings/available-slots?doctorId=${booking.doctor?._id}&date=${newDate}`
      );
      const result = await res.json();
      setSlots(result.data || []);
    } catch {
      setSlots([]);
    }
    setLoadingSlots(false);
  };

  const confirm = async () => {
    if (!selectedSlot) return toast.error("Pick a time slot first");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/bookings/${booking._id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          appointmentDate: date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success("Appointment rescheduled");
      onDone(result.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-md flex flex-col gap-3">
      <input
        type="date"
        min={new Date().toISOString().split("T")[0]}
        value={date}
        onChange={(e) => loadSlots(e.target.value)}
        className="border border-solid border-[#0066ff34] rounded-md px-2 py-1"
      />
      {loadingSlots && <p className="text-[13px] text-textColor">Loading slots...</p>}
      {!loadingSlots && date && slots.length === 0 && (
        <p className="text-[13px] text-textColor">No slots available that day</p>
      )}
      {slots.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {slots.map((s) => (
            <button
              key={s.startTime}
              onClick={() => setSelectedSlot(s)}
              className={`px-3 py-1 rounded text-[13px] border border-solid ${
                selectedSlot?.startTime === s.startTime
                  ? "bg-primaryColor text-white border-primaryColor"
                  : "border-[#0066ff34]"
              }`}
            >
              {s.startTime}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={confirm}
        className="px-3 py-1 rounded bg-green-600 text-white text-[13px] w-fit"
      >
        Confirm
      </button>
    </div>
  );
};

const BookingRow = ({ item, onCancel, onReschedule }) => {
  const [rescheduling, setRescheduling] = useState(false);
  return (
    <div className="shadow-panelShadow rounded-md p-4 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <figure className="w-14 h-14 rounded-full overflow-hidden shrink-0">
            <Avatar src={item.doctor?.photo} className="w-full h-full rounded-full" />
          </figure>
          <div>
            <h4 className="text-headingColor font-bold text-[16px]">{item.doctor?.name}</h4>
            <p className="text-textColor text-[14px]">{item.doctor?.specialization}</p>
            <p className="text-textColor text-[14px]">
              {formatDate(item.appointmentDate)} · {item.startTime} · ${item.ticketPrice}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-[13px] font-semibold capitalize ${
              statusStyles[item.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {item.status}
          </span>
          {item.status === "confirmed" && item.consultationType === "video" && (
            <a
              href={getVideoCallLink(item._id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 rounded bg-green-600 text-white text-[13px]"
            >
              Join Video Call
            </a>
          )}
          {item.status === "pending" && (
            <button
              onClick={() => setRescheduling((r) => !r)}
              className="px-3 py-1 rounded bg-primaryColor text-white text-[13px]"
            >
              Reschedule
            </button>
          )}
          {["pending", "confirmed"].includes(item.status) && (
            <button
              onClick={() => onCancel(item._id)}
              className="px-3 py-1 rounded bg-red-600 text-white text-[13px]"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      {rescheduling && (
        <RescheduleWidget
          booking={item}
          onDone={(updated) => {
            setRescheduling(false);
            onReschedule(item._id, updated);
          }}
        />
      )}
    </div>
  );
};

const MyBookings = () => {
  const {
    data: appointments,
    loading,
    error,
  } = useFetchData(`${BASE_URL}/users/appointments/my-appointments`);
  const { data: summary } = useFetchData(`${BASE_URL}/users/dashboard-summary`);
  const [localAppointments, setLocalAppointments] = useState(null);
  const [section, setSection] = useState("upcoming");

  const list = localAppointments ?? appointments;

  const patchBooking = (id, updates) => {
    setLocalAppointments((prev) =>
      (prev ?? appointments).map((b) => (b._id === id ? { ...b, ...updates } : b))
    );
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: "cancelled", reason: "Cancelled by patient" }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success("Appointment cancelled");
      patchBooking(id, { status: "cancelled" });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusesForSection = {
    upcoming: UPCOMING_STATUSES,
    history: HISTORY_STATUSES,
    cancelled: CANCELLED_STATUSES,
  }[section];

  const sectionList = list
    ?.filter((item) => statusesForSection.includes(item.status))
    .sort((a, b) => {
      const diff = new Date(a.appointmentDate) - new Date(b.appointmentDate);
      const dateDiff = section === "upcoming" ? diff : -diff;
      return dateDiff !== 0 ? dateDiff : a.startTime.localeCompare(b.startTime);
    });

  return (
    <div>
      <NextAppointmentCard appointment={summary?.nextAppointment} />

      <div className="flex flex-wrap gap-3 mb-5">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`px-4 py-2 rounded-md text-[14px] font-semibold border border-solid border-primaryColor ${
              section === s.key ? "bg-primaryColor text-white" : "text-headingColor"
            }`}
          >
            {s.label}
            {summary && (
              <span className="ml-1">
                ({s.key === "upcoming"
                  ? summary.upcomingCount
                  : s.key === "history"
                  ? summary.historyCount
                  : summary.cancelledCount}
                )
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && !error && <Loading />}
      {error && !loading && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="flex flex-col gap-5">
          {sectionList?.map((item) => (
            <BookingRow
              key={item._id}
              item={item}
              onCancel={cancelBooking}
              onReschedule={(id, updated) => patchBooking(id, updated)}
            />
          ))}
        </div>
      )}
      {!loading && !error && sectionList?.length === 0 && (
        <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
          Nothing here yet
        </h2>
      )}
    </div>
  );
};

export default MyBookings;
