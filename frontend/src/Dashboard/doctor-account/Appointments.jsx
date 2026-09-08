import { useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import { formatDate } from "../../utils/formatDate";
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

const isPast = (item) => {
  const end = new Date(item.appointmentDate);
  const [h, m] = item.endTime.split(":").map(Number);
  end.setUTCHours(h, m, 0, 0);
  return end.getTime() <= Date.now();
};

const Appointments = ({ appointments }) => {
  const [localAppointments, setLocalAppointments] = useState(null);
  const list = localAppointments ?? appointments;

  const updateStatus = async (id, status, reason) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status, reason }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(`Appointment ${status}`);
      setLocalAppointments((prev) =>
        (prev ?? appointments).map((b) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  const reject = (id) => {
    const reason = window.prompt("Reason for declining this appointment (optional):") || "";
    updateStatus(id, "rejected", reason);
  };

  const cancel = (id) => {
    const reason = window.prompt("Reason for cancelling this appointment (optional):") || "";
    updateStatus(id, "cancelled", reason);
  };

  return (
    <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-gray-500">
      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3">
            Patient
          </th>
          <th scope="col" className="px-6 py-3">
            Email
          </th>
          <th scope="col" className="px-6 py-3">
            Price
          </th>
          <th scope="col" className="px-6 py-3">
            Date / Time
          </th>
          <th scope="col" className="px-6 py-3">
            Status
          </th>
          <th scope="col" className="px-6 py-3">
            Actions
          </th>
        </tr>
      </thead>
      <tbody>
        {list?.map((item) => (
          <tr key={item._id}>
            <th
              scope="row"
              className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap"
            >
              <Avatar src={item.user?.photo} className="w-10 h-10 rounded-full" />
              <div className="pl-3">
                <div className="text-base font-semibold">{item.user?.name}</div>
                <div className="text-normal text-gray-500">{item.user?.gender}</div>
              </div>
            </th>
            <td className="px-6 py-4">{item.user?.email}</td>
            <td className="px-6 py-4">{item.ticketPrice}</td>
            <td className="px-6 py-4">
              {formatDate(item.appointmentDate)} · {item.startTime}
            </td>
            <td className="px-6 py-4">
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-semibold capitalize ${
                  statusStyles[item.status] || "bg-gray-100 text-gray-700"
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="px-6 py-4 flex gap-2 flex-wrap">
              {item.status === "pending" && (
                <>
                  <button
                    onClick={() => updateStatus(item._id, "confirmed")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => reject(item._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </>
              )}
              {item.status === "confirmed" && isPast(item) && (
                <>
                  <button
                    onClick={() => updateStatus(item._id, "completed")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(item._id, "no-show")}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    No-show
                  </button>
                </>
              )}
              {item.status === "confirmed" && !isPast(item) && (
                <button
                  onClick={() => cancel(item._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Cancel
                </button>
              )}
              {item.status === "confirmed" && item.consultationType === "video" && (
                <a
                  href={getVideoCallLink(item._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-3 py-1 rounded inline-block"
                >
                  Join Video Call
                </a>
              )}
            </td>
          </tr>
        ))}
      </tbody>
      {list?.length === 0 && (
        <tbody>
          <tr>
            <td colSpan={6} className="text-center py-6 text-primaryColor font-semibold">
              No appointments yet
            </td>
          </tr>
        </tbody>
      )}
    </table>
    </div>
  );
};

export default Appointments;
