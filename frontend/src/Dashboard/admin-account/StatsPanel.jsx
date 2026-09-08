import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Loading from "../../components/Loader/Loading";
import Error from "../../components/Error/Error";
import { formatDate } from "../../utils/formatDate";

const StatCard = ({ label, value }) => (
  <div className="shadow-panelShadow rounded-md p-5">
    <p className="text-textColor text-[14px]">{label}</p>
    <h3 className="text-headingColor text-[28px] font-bold">{value}</h3>
  </div>
);

const StatsPanel = () => {
  const { data: stats, loading, error } = useFetchData(`${BASE_URL}/admin/stats`);

  if (loading) return <Loading />;
  if (error) return <Error errMessage={error} />;
  if (!stats) return null;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Patients" value={stats.totalPatients} />
        <StatCard label="Doctors" value={stats.totalDoctors} />
        <StatCard label="Pending Doctors" value={stats.pendingDoctors} />
        <StatCard label="Approved Doctors" value={stats.approvedDoctors} />
        <StatCard label="Rejected Doctors" value={stats.rejectedDoctors} />
        <StatCard label="Suspended Doctors" value={stats.suspendedDoctors} />
        <StatCard label="Total Bookings" value={stats.totalBookings} />
        <StatCard label="Pending Bookings" value={stats.pendingBookings} />
        <StatCard label="Confirmed Bookings" value={stats.confirmedBookings} />
        <StatCard label="Completed Bookings" value={stats.completedBookings} />
        <StatCard label="Cancelled Bookings" value={stats.cancelledBookings} />
        <StatCard label="Rejected Bookings" value={stats.rejectedBookings} />
        <StatCard label="No-shows" value={stats.noShowBookings} />
        <StatCard label="Revenue" value={`$${stats.totalRevenue}`} />
      </div>
      <h3 className="text-headingColor font-bold text-[20px] mb-4">Recent Bookings</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Patient</th>
              <th className="px-6 py-3">Doctor</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings?.map((b) => (
              <tr key={b._id}>
                <td className="px-6 py-4">{b.user?.name}</td>
                <td className="px-6 py-4">{b.doctor?.name}</td>
                <td className="px-6 py-4">{formatDate(b.appointmentDate)}</td>
                <td className="px-6 py-4 capitalize">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsPanel;
