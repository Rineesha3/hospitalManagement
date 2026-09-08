import { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { formatDate } from "../../utils/formatDate";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  "no-show": "bg-gray-200 text-gray-700",
};

const BookingsPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 10, status });
      const res = await fetch(`${BASE_URL}/bookings/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setBookings(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="border border-solid border-[#0066ff34] rounded-md px-3 py-2 mb-6"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="rejected">Rejected</option>
        <option value="no-show">No-show</option>
      </select>
      {loading && <Loading />}
      {error && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-6 py-4">{b.user?.name}</td>
                  <td className="px-6 py-4">{b.doctor?.name}</td>
                  <td className="px-6 py-4">{formatDate(b.appointmentDate)}</td>
                  <td className="px-6 py-4">${b.ticketPrice}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold capitalize ${
                        statusStyles[b.status] || "bg-gray-100"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
              No bookings found
            </h2>
          )}
          {pagination.pages > 1 && (
            <div className="flex gap-2 justify-center mt-5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchBookings(p)}
                  className={`px-3 py-1 rounded ${
                    p === pagination.page ? "bg-primaryColor text-white" : "bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingsPanel;
