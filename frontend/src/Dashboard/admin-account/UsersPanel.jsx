import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({ page, limit: 8, search });
      const res = await fetch(`${BASE_URL}/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      setUsers(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(1), 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const setActive = async (id, isActive) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users/admin/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Permanently delete this patient account?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/users/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);
      toast.success(result.message);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <input
        type="search"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border border-solid border-[#0066ff34] rounded-md px-3 py-2 w-full max-w-[400px] mb-6"
      />
      {loading && <Loading />}
      {error && <Error errMessage={error} />}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-6 py-4">{u.name}</td>
                  <td className="px-6 py-4">{u.email}</td>
                  <td className="px-6 py-4 capitalize">{u.role}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-semibold ${
                        u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {u.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    {u.role !== "admin" && (
                      <>
                        {u.isActive ? (
                          <button
                            onClick={() => setActive(u._id, false)}
                            className="bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => setActive(u._id, true)}
                            className="bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => deleteUser(u._id)}
                          className="bg-gray-700 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <h2 className="mt-5 text-center leading-7 text-[20px] font-semibold text-primaryColor">
              No users found
            </h2>
          )}
          {pagination.pages > 1 && (
            <div className="flex gap-2 justify-center mt-5">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchUsers(p)}
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

export default UsersPanel;
