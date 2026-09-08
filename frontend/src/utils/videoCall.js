// Each confirmed video booking gets its own permanent Jitsi Meet room,
// derived from the booking id so both patient and doctor land in the same room
// without any server-side call setup.
export const getVideoCallLink = (bookingId) =>
  `https://meet.jit.si/medicare-appt-${bookingId}`;
