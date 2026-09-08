import useFetchData from "../../hooks/useFetchData";
import { BASE_URL } from "../../config";
import Avatar from "../../components/Avatar/Avatar";
import { getVideoCallLink } from "../../utils/videoCall";

const StatCard = ({ label, value }) => (
  <div className="shadow-panelShadow rounded-md p-4">
    <p className="text-textColor text-[13px]">{label}</p>
    <h3 className="text-headingColor text-[24px] font-bold">{value}</h3>
  </div>
);

const DashboardSummary = () => {
  const { data: summary } = useFetchData(`${BASE_URL}/doctors/dashboard-summary`);
  if (!summary) return null;

  return (
    <div className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Today's Appointments" value={summary.todaysAppointments?.length || 0} />
        <StatCard label="Pending Requests" value={summary.pendingCount} />
        <StatCard label="Completed" value={summary.completedCount} />
        <StatCard label="Revenue" value={`$${summary.revenue}`} />
      </div>
      {summary.todaysAppointments?.length > 0 && (
        <div>
          <h4 className="text-headingColor font-bold text-[16px] mb-3">Today</h4>
          <div className="flex flex-col gap-3">
            {summary.todaysAppointments.map((a) => (
              <div key={a._id} className="shadow-panelShadow rounded-md p-3 flex items-center gap-3">
                <Avatar src={a.user?.photo} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-headingColor">{a.user?.name}</p>
                  <p className="text-[13px] text-textColor">
                    {a.startTime} - {a.endTime} · {a.status}
                  </p>
                </div>
                {a.status === "confirmed" && a.consultationType === "video" && (
                  <a
                    href={getVideoCallLink(a._id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 bg-green-600 text-white px-3 py-1 rounded text-[13px]"
                  >
                    Join
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
