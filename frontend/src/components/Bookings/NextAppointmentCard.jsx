import { formatDate } from "../../utils/formatDate";
import Avatar from "../Avatar/Avatar";
import { getVideoCallLink } from "../../utils/videoCall";

const NextAppointmentCard = ({ appointment }) => {
  if (!appointment) {
    return (
      <div className="shadow-panelShadow rounded-md p-5 mb-6 bg-indigo-50">
        <p className="text-textColor text-[14px]">No upcoming appointments</p>
      </div>
    );
  }

  return (
    <div className="shadow-panelShadow rounded-md p-4 sm:p-5 mb-6 bg-indigo-50 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <figure className="w-14 h-14 rounded-full overflow-hidden shrink-0">
          <Avatar src={appointment.doctor?.photo} className="w-full h-full rounded-full" />
        </figure>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-primaryColor uppercase">Next Appointment</p>
          <h4 className="text-headingColor font-bold text-[16px] truncate">{appointment.doctor?.name}</h4>
          <p className="text-textColor text-[14px] truncate">{appointment.doctor?.specialization}</p>
          <p className="text-textColor text-[14px]">
            {formatDate(appointment.appointmentDate)} · {appointment.startTime}
          </p>
        </div>
      </div>
      {appointment.status === "confirmed" && appointment.consultationType === "video" && (
        <a
          href={getVideoCallLink(appointment._id)}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 sm:ml-auto text-center px-3 py-1.5 rounded bg-green-600 text-white text-[13px] font-semibold"
        >
          Join Video Call
        </a>
      )}
    </div>
  );
};

export default NextAppointmentCard;
