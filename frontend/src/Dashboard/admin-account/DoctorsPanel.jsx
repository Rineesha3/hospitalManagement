import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  suspended: "bg-gray-200 text-gray-700",
};

const DoctorsPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDoctors = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 8, search, status });
      const res = await fetch(`${BASE_URL}/doctors/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setDoctors(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchDoctors(1), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/doctors/approve/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchDoctors(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm("Permanently delete this doctor account?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/doctors/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchDoctors(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="search"
          placeholder="Search by name, email or specialization"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-solid border-[#0066ff34] rounded-md px-3 py-2 flex-1 min-w-[220px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-solid border-[#0066ff34] rounded-md px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {loading && <Loading />}
      {error && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Specialization</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor._id}>
                  <td className="px-6 py-4">{doctor.name}</td>
                  <td className="px-6 py-4">{doctor.email}</td>
                  <td className="px-6 py-4">{doctor.specialization}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold capitalize ${
                        statusStyles[doctor.isApproved] || "bg-gray-100"
                      }`}
                    >
                      {doctor.isApproved}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    <button
                      disabled={doctor.isApproved === "approved"}
                      onClick={() => updateStatus(doctor._id, "approved")}
                      className="bg-green-600 disabled:opacity-40 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      disabled={doctor.isApproved === "rejected"}
                      onClick={() => updateStatus(doctor._id, "rejected")}
                      className="bg-red-600 disabled:opacity-40 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                    {doctor.isApproved === "approved" && (
                      <button
                        onClick={() => updateStatus(doctor._id, "suspended")}
                        className="bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Suspend
                      </button>
                    )}
                    {doctor.isApproved === "suspended" && (
                      <button
                        onClick={() => updateStatus(doctor._id, "approved")}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        Reinstate
                      </button>
                    )}
                    <button
                      onClick={() => deleteDoctor(doctor._id)}
                      className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {doctors.length === 0 && (
            <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
              No doctors found
            </h2>
          )}
          {pagination.pages > 1 && (
            <div className="flex gap-2 justify-center mt-5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchDoctors(p)}
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

export default DoctorsPanel;
