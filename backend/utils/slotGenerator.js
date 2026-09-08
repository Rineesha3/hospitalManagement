import Booking from "../models/BookingSchema.js";

export const SLOT_MINUTES = 30;

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function normalizeDateToUTCMidnight(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export function getWeekdayName(dateStr) {
  return WEEKDAYS[normalizeDateToUTCMidnight(dateStr).getUTCDay()];
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function expandTemplateBlock(startingTime, endingTime, slotMinutes = SLOT_MINUTES) {
  const start = timeToMinutes(startingTime);
  const end = timeToMinutes(endingTime);
  const slots = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
    slots.push({ startTime: minutesToTime(t), endTime: minutesToTime(t + slotMinutes) });
  }
  return slots;
}

export function generateSlotsForWeekday(timeSlots, weekday) {
  const seen = new Set();
  const slots = [];
  for (const block of timeSlots || []) {
    if (!block?.day || block.day.toLowerCase() !== weekday) continue;
    for (const slot of expandTemplateBlock(block.startingTime, block.endingTime)) {
      if (seen.has(slot.startTime)) continue;
      seen.add(slot.startTime);
      slots.push(slot);
    }
  }
  return slots.sort((a, b) => (a.startTime < b.startTime ? -1 : 1));
}

export function filterAvailableSlots(allSlots, bookedStartTimes, dateStr) {
  const bookedSet = bookedStartTimes instanceof Set ? bookedStartTimes : new Set(bookedStartTimes);
  const isToday = normalizeDateToUTCMidnight(dateStr).getTime() === normalizeDateToUTCMidnight(new Date().toISOString().split("T")[0]).getTime();
  const nowMinutes = new Date().getUTCHours() * 60 + new Date().getUTCMinutes();
  return allSlots.filter((slot) => {
    if (bookedSet.has(slot.startTime)) return false;
    if (isToday && timeToMinutes(slot.startTime) <= nowMinutes) return false;
    return true;
  });
}

export async function getAvailableSlotsForDate(doctor, dateStr) {
  const weekday = getWeekdayName(dateStr);
  const allSlots = generateSlotsForWeekday(doctor.timeSlots, weekday);
  if (allSlots.length === 0) return [];

  const appointmentDate = normalizeDateToUTCMidnight(dateStr);
  const booked = await Booking.find({
    doctor: doctor._id,
    appointmentDate,
    status: { $nin: ["cancelled", "rejected"] },
  }).select("startTime");

  return filterAvailableSlots(allSlots, new Set(booked.map((b) => b.startTime)), dateStr);
}

export async function getEarliestAvailableSlot(doctor, lookaheadDays = 7) {
  const today = new Date();
  for (let i = 0; i < lookaheadDays; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const slots = await getAvailableSlotsForDate(doctor, dateStr);
    if (slots.length > 0) {
      return { date: dateStr, startTime: slots[0].startTime };
    }
  }
  return null;
}
